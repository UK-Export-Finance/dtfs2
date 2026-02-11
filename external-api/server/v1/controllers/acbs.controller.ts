/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */

import axios from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS, ENTITY_TYPE } from '@ukef/dtfs2-common';
import { Request, Response } from 'express';
import { Amendment } from '../../interfaces';
import { UNDERWRITER_MANAGER_DECISIONS } from '../../constants';
import { validUkefId } from '../../helpers';

dotenv.config();

const apimUrl = process.env.APIM_TFS_URL;
const acbsUrl = process.env.AZURE_ACBS_FUNCTION_URL;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
};

export const checkDealId = async (dealId: any) => {
  console.info('Checking deal id %s with ACBS', dealId);

  const ukefId = validUkefId(dealId);

  if (!ukefId) {
    return new Error('Invalid deal id');
  }

  const response: any = await axios({
    method: 'get',
    headers,
    url: `${apimUrl}v1/deals/${ukefId}`,
  });

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (deal)');
};

export const checkFacilityId = async (facilityId: any) => {
  console.info('Checking facility id %s with ACBS', facilityId);

  const ukefId = validUkefId(facilityId);

  if (!ukefId) {
    return new Error('Invalid facility id');
  }

  const response = await axios({
    method: 'get',
    headers,
    url: `${apimUrl}v1/facilities/${ukefId}`,
  }).catch((catchErr: any) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (facility)');
};

/**
 * Find UKEF ID consumption status, if the UKEF ID is allocated to either
 * a deal or a facility then ID cannot be used.
 * @param req Request
 * @param res Response
 * @returns API response
 */
export const findOne = async (req: Request, res: Response) => {
  const { entityType, id } = req.params;

  if (entityType === ENTITY_TYPE.DEAL) {
    const dealIdStatus = await checkDealId(id);
    console.info('Checked dealId %s with ACBS API %s', id, dealIdStatus);

    return res.status(dealIdStatus).send();
  }

  if (entityType === ENTITY_TYPE.FACILITY) {
    const facilityIdStatus = await checkFacilityId(id);
    console.info('Checked facilityId %s with ACBS API %s', id, facilityIdStatus);

    return res.status(facilityIdStatus).send();
  }

  return res.status(500).send();
};

/**
 * Invokes ACBS DOF using HTTP `POST` method.
 * @param deal Deal object
 * @param bank Bank object
 * @returns DOF response
 */
const createAcbsRecord = async (deal: any, bank: any) => {
  if (deal) {
    const response = await axios({
      method: 'post',
      headers,
      url: `${acbsUrl}/api/orchestrators/acbs`,
      data: {
        deal,
        bank,
      },
    }).catch((error: any) => {
      console.error('Error creating ACBS record %o', error);
      return error;
    });

    if (response.status) {
      return response;
    }
  }

  // Upon failure
  return null;
};

/**
 * Create ACBS records
 * @param req Request
 * @param res Response
 * @returns Response object
 */
export const createAcbsRecordPOST = async (req: Request, res: Response) => {
  try {
    const { deal, bank } = req.body;
    const response = await createAcbsRecord(deal, bank);
    if (response) {
      const { status, data } = response;
      return res.status(status).send(data);
    }
  } catch (error: unknown) {
    console.error('ACBS create POST failed %o', error);
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

/**
 * Invokes facility issuance DOF using HTTP `POST` method.
 * @param id UKEF Facility ID
 * @param facility Facility object
 * @param deal Deal object
 * @returns DOF response
 */
const issueAcbsFacility = async (id: any, facility: object, deal: object) => {
  if (id) {
    const response = await axios({
      method: 'post',
      headers,
      url: `${acbsUrl}/api/orchestrators/acbs-issue-facility`,
      data: {
        facilityIdentifier: id,
        facility,
        deal,
      },
    }).catch((error) => {
      console.error('ACBS issue facility POST failed %o', error);
      return error;
    });

    if (response.status) {
      return response;
    }
  }

  // Upon failure
  return null;
};

/**
 * Issue facility in ACBS
 * @param req Request
 * @param res Response
 * @returns Response object
 */
export const issueAcbsFacilityPOST = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { facility, deal } = req.body;
    const response = await issueAcbsFacility(id, facility, deal);
    if (response) {
      const { status, data } = response;
      return res.status(status).send(data);
    }
  } catch (error) {
    console.error('Error during ACBS facility issue POST %o', error);
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

/**
 * Invoked Azure DOF using HTTP `POST` method.
 * @param {object} amendment Amendment object comprising facility ID and amends. A amendment at a time is processed.
 * @returns {Promise<Object | null>} DOF Response
 */
const amendAcbsFacility = async (amendment: Amendment) => {
  const hasAmendment = amendment.coverEndDate || amendment.amount;

  if (hasAmendment) {
    const response = await axios({
      method: 'post',
      headers,
      url: `${acbsUrl}/api/orchestrators/acbs-amend-facility`,
      data: {
        amendment,
      },
    }).catch((error: any) => {
      console.error('Error amending ACBS facility %o', error);
      return error;
    });

    if (response.status) {
      return response;
    }
  }

  return null;
};

/**
 * ACBS facility amendment entry function.
 * Constructs acceptable payload by DOF.
 * @param {object} req Request
 * @param {object} res Response
 * @returns {Promise<object>} Response object with HTTP code as `status` and response as `data`.
 */
export const amendAcbsFacilityPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amendments, facility, deal } = req.body;
    // Construct payload
    const payload = {
      facilityIdentifier: id,
      amount: amendments.ukefExposure,
      coverEndDate: amendments.coverEndDate,
      effectiveDate: amendments.effectiveDate,
      facility,
      deal,
    };

    // Refine payload

    // Change requested
    const { changeFacilityValue, changeCoverEndDate } = amendments;
    // UW Decision
    const { value, coverEndDate } = amendments.ukefDecision || false;
    const valueDeclined = value === UNDERWRITER_MANAGER_DECISIONS.DECLINED;
    const coverEndDateDeclined = coverEndDate === UNDERWRITER_MANAGER_DECISIONS.DECLINED;
    // Delete frivolous property
    if (!changeFacilityValue || valueDeclined) {
      delete payload.amount;
    }
    if (!changeCoverEndDate || coverEndDateDeclined) {
      delete payload.coverEndDate;
    }

    const response = await amendAcbsFacility(payload);

    if (response) {
      // Successful
      const { status, data } = response;
      return res.status(status).send(data);
    }
  } catch (error) {
    console.error('Error executing ACBS Facility POST %o', error);
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

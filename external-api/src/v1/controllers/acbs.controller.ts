import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { Amendment } from '../../interfaces';
import { ENTITY_TYPE, UNDERWRITER_MANAGER_DECISIONS } from '../../constants';
import { validUkefId } from '../../utils/validUkefId';

dotenv.config();

const apimUrl = process.env.APIM_TFS_URL;
const acbsUrl = process.env.AZURE_ACBS_FUNCTION_URL;

const headers = {
  'Content-Type': 'application/json',
};

export const checkDealId = async (dealId: any) => {
  console.info(`Checking deal id ${dealId} with ACBS`);

  const ukefId = validUkefId(dealId);

  if (!ukefId) {
    return new Error('Invalid deal id');
  }

  const response: any = await axios({
    method: 'get',
    headers,
    url: `${apimUrl}deals/${ukefId}`,
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
  console.info(`Checking facility id ${facilityId} with ACBS`);

  const ukefId = validUkefId(facilityId);

  if (!ukefId) {
    return new Error('Invalid facility id');
  }

  const response = await axios({
    method: 'get',
    headers,
    url: `${apimUrl}facilities/${ukefId}`,
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
    console.info(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);

    return res.status(dealIdStatus).send();
  }

  if (entityType === ENTITY_TYPE.FACILITY) {
    const facilityIdStatus = await checkFacilityId(id);
    console.info(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);

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
    }).catch((e: any) => {
      console.error('Error creating ACBS record: ', { e });
      return e;
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
  } catch (error: any) {
    console.error('ACBS create POST failed ', { error });
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

/**
 * Invokes facility issuance DOF using HTTP `POST` method.
 * @param id Facility ID
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
        facilityId: id,
        facility,
        deal,
      },
    }).catch((e) => {
      console.error('ACBS issue facility POST failed ', { e });
      return e;
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
    console.error('Error during ACBS facility issue POST: ', { error });
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

/**
 * Invoked Azure DOF using HTTP `POST` method.
 * @param {Object} amendment Amendment object comprising facility ID and amends. A amendment at a time is processed.
 * @returns {Object} DOF Response
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
    }).catch((e: any) => {
      console.error('Error amending ACBS facility: ', { e });
      return e;
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
 * @param {Object} req Request
 * @param {Object} res Response
 * @return {Object} Response object with HTTP code as `status` and response as `data`.
 */
export const amendAcbsFacilityPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amendments, facility, deal } = req.body;
    // Construct payload
    const payload = {
      facilityId: id,
      amount: amendments.ukefExposure,
      coverEndDate: amendments.coverEndDate,
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
    console.error('Error executing ACBS Facility POST: ', { error });
    return res.status(400).send();
  }

  // Upon failure
  return res.status(400).send();
};

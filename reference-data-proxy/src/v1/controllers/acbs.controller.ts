// ACBS API is used to check that deal/facility ids are not already being used.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { Amendment } from '../../interfaces';
import { ENTITY_TYPE, UNDERWRITER_MANAGER_DECISIONS } from '../../constants';

dotenv.config();

const acbsFunctionUrl: any = process.env.AZURE_ACBS_FUNCTION_URL;
const acbsFacilityUrl: any = process.env.MULESOFT_API_ACBS_FACILITY_URL;
const acbsDealUrl: any = process.env.MULESOFT_API_ACBS_DEAL_URL;
const username: any = process.env.MULESOFT_API_KEY;
const password: any = process.env.MULESOFT_API_SECRET;

export const checkDealId = async (dealId: any) => {
  console.info(`Checking deal id ${dealId} with ACBS`);

  const response: any = await axios({
    method: 'get',
    url: `${acbsDealUrl}/${dealId}`,
    auth: { username, password },
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

  const response = await axios({
    method: 'get',
    url: `${acbsFacilityUrl}/${facilityId}`,
    auth: { username, password },
  }).catch((catchErr: any) => catchErr);

  if (response.status) {
    return response.status;
  }

  if (response && response.response && response.response.status) {
    return response.response.status;
  }

  return new Error('Error calling ACBS API (facility)');
};

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

const createAcbsRecord = async (deal: any, bank: any) => {
  if (deal) {
    try {
      await axios({
        method: 'post',
        url: `${acbsFunctionUrl}/api/orchestrators/acbs`,
        data: {
          deal,
          bank,
        },
      });
    } catch (error: any) {
      console.error('Error creating ACBS record: ', { error });
      return null;
    }
  }
};

export const createAcbsRecordPOST = async (req: Request, res: Response) => {
  try {
    const { deal, bank } = req.body;
    const response = await createAcbsRecord(deal, bank);
    if (response) {
      const { status, data } = response;
      return res.status(status).send(data);
    }

    return res.status(400).send();
  } catch (error: any) {
    console.error('ACBS create POST failed ', { error });
    return res.status(400).send();
  }
};

const issueAcbsFacility = async (id: any, facility: object, deal: object) => {
  if (id) {
    try {
      await axios({
        method: 'post',
        url: `${acbsFunctionUrl}/api/orchestrators/acbs-issue-facility`,
        data: {
          facilityId: id,
          facility,
          deal,
        },
      });
    } catch (error: any) {
      console.error('ACBS issue facility POST failed ', { error });
      return null;
    }
  }
};

export const issueAcbsFacilityPOST = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { facility, deal } = req.body;
    const response = await issueAcbsFacility(id, facility, deal);
    if (response) {
      const { status, data } = response;
      return res.status(status).send(data);
    }
  } catch (e) {
    console.error('Error during ACBS facility issue POST: ', { e });
    return res.status(400).send();
  }
};

/**
 * Invoked Azure DOF using HTTP `POST` method.
 * @param {Object} amendment Amendment object comprising facility ID and amends. A amendment at a time is processed.
 * @returns {Object} DOF Response
 */
const amendAcbsFacility = async (amendment: Amendment) => {
  const hasAmendment = amendment.coverEndDate || amendment.amount;

  if (hasAmendment) {
    try {
      return axios({
        method: 'post',
        url: `${acbsFunctionUrl}/api/orchestrators/acbs-amend-facility`,
        data: {
          amendment,
        },
      });
    } catch (error: any) {
      console.error('Error amending ACBS facility: ', { error });
      return null;
    }
  }
};

/**
 * ACBS facility amendment entry function.
 * Constructs acceptable payload by DOF.
 * @param {Object} req Request
 * @param {Object} res Response
 * @return {Object} Response object with HTTP code as `status` and response as `data`.
 */
export const amendAcbsFacilityPost = async (req: Request, res: Response) => {
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
  // Upon failure
  return res.status(400).send();
};

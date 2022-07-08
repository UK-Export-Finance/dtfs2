// ACBS API is used to check that deal/facility ids are not already being used.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { ENTITY_TYPE } from '../../constants';

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
    const response = await axios({
      method: 'post',
      url: `${acbsFunctionUrl}/api/orchestrators/acbs`,
      data: {
        deal,
        bank,
      },
    }).catch((err: any) => err);
    return response;
  }
  return {};
};

export const createAcbsRecordPOST = async (req: Request, res: Response) => {
  if (req) {
    try {
      const { deal, bank } = req.body;
      const { status, data } = await createAcbsRecord(deal, bank);
      return res.status(status).send(data);
    } catch (error) {
      console.error('ACBS post failed ', { error });
    }
  }
  return res.status(400).send();
};

const issueAcbsFacility = async (id: any, facility: object, deal: object) => {
  if (id) {
    const response = await axios({
      method: 'post',
      url: `${acbsFunctionUrl}/api/orchestrators/acbs-issue-facility`,
      data: {
        facilityId: id,
        facility,
        deal,
      },
    }).catch((err: any) => err);
    return response;
  }
  return {};
};

export const issueAcbsFacilityPOST = async (req: Request, res: Response) => {
  if (req) {
    const { id } = req.params;
    const { facility, deal } = req.body;
    const { status, data } = await issueAcbsFacility(id, facility, deal);
    return res.status(status).send(data);
  }
  return res.status(400).send();
};

/**
 * Invoked Azure DOF using HTTP `POST` method.
 * @param {Object} amendment Amendment object comprising facility ID and amends. A amendment at a time is processed.
 * @returns {Object} DOF Response
 */
const amendAcbsFacility = async (amendment: object) => {
  const hasAcceptablePayload = Object.prototype.hasOwnProperty.call(amendment, 'coverEndDate') || Object.prototype.hasOwnProperty.call(amendment, 'amount');

  if (amendment && hasAcceptablePayload) {
    const response = await axios({
      method: 'post',
      url: `${acbsFunctionUrl}/api/orchestrators/acbs-amend-facility`,
      data: {
        amendment,
      },
    }).catch((e: any) => e);

    return response;
  }
  return {};
};

/**
 * ACBS facility amendment entry function.
 * Constructs acceptable payload by DOF.
 * @param {Object} req Request
 * @param {Object} res Response
 * @return {Object} Response object with HTTP code as `status` and response as `data`.
 */
export const amendAcbsFacilityPost = async (req: Request, res: Response) => {
  if (req) {
    const { id } = req.params;
    const { amendments, deal } = req.body;
    // Construct payload
    const payload = {
      facilityId: id,
      coverEndDate: amendments.coverEndDate,
      amount: amendments.ukefExposure,
      deal,
    };

    // Refine payload
    if (!amendments.changeCoverEndDate) delete payload.coverEndDate;
    if (!amendments.changeFacilityValue) delete payload.amount;

    const { status, data } = await amendAcbsFacility(payload);
    // Successful
    return res.status(status).send(data);
  }
  // Bad Request
  return res.status(400).send();
};

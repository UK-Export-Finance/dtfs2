// ACBS API is used to check that deal/facility ids are not already being used.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.

import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { ENTITY_TYPE } from '../../constants';

dotenv.config();

const acbsFunctionUrl: any = process.env.AZURE_ACBS_FUNCTION_URL;
const acbsFacilityUrl: any = process.env.MULESOFT_API_ACBS_FACILITY_URL;
const acbsDealUrl: any = process.env.MULESOFT_API_ACBS_DEAL_URL;
const username: any = process.env.MULESOFT_API_KEY;
const password: any = process.env.MULESOFT_API_SECRET;

export const checkDealId = async (dealId: any) => {
  console.log(`Checking deal id ${dealId} with ACBS`);

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
  console.log(`Checking facility id ${facilityId} with ACBS`);

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
    console.log(`Checked dealId ${id} with ACBS API: ${dealIdStatus}`);

    return res.status(dealIdStatus).send();
  }

  if (entityType === ENTITY_TYPE.FACILITY) {
    const facilityIdStatus = await checkFacilityId(id);
    console.log(`Checked facilityId ${id} with ACBS API: ${facilityIdStatus}`);

    return res.status(facilityIdStatus).send();
  }

  return res.status(500).send();
};

const issueAcbsFacility = async (id: any, facility: any, supplierName: any) => {
  if (id) {
    const response = await axios({
      method: 'post',
      url: `${acbsFunctionUrl}/api/orchestrators/acbs-issue-facility`,
      data: {
        facilityId: id,
        facility,
        supplierName,
      },
    }).catch((err: any) => err);
    return response;
  }
  return {};
};

export const issueAcbsFacilityPOST = async (req: Request, res: Response) => {
  if (req) {
    const { id } = req.params;
    const { facility, supplierName } = req.body;
    const { status, data } = await issueAcbsFacility(id, facility, supplierName);
    return res.status(status).send(data);
  }
  return res.status(400).send();
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

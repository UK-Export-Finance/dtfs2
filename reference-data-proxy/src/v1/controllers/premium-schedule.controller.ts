// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { objectIsEmpty } from '../../utils';
dotenv.config();

const mdmEAurl: any = process.env.MULESOFT_API_UKEF_MDM_EA_URL;
const username: any = process.env.MULESOFT_API_UKEF_MDM_EA_KEY;
const password: any = process.env.MULESOFT_API_UKEF_MDM_EA_SECRET;

const postPremiumSchedule = async (premiumSchedulePayload: any) => {
  if (objectIsEmpty(premiumSchedulePayload)) {
    return null;
  }
  console.log(premiumSchedulePayload);
  const response = await axios({
    method: 'post',
    url: `${mdmEAurl}/premium/schedule`,
    auth: { username, password },
    headers: {
      'Content-Type': 'application/json',
    },
    data: [premiumSchedulePayload],
  }).catch((error: any) => {
    console.error(`Error calling POST Premium schedule with facilityURN: ${premiumSchedulePayload.facilityURN} \n`, error.response.data, error.response.status);
    return { data: error?.response?.data, status: error?.response?.status };
  });

  console.info(`Premium schedule successfully created for ${premiumSchedulePayload.facilityURN}`);
  return response.status ? response.status : response;
};

const getScheduleData = async (facilityURN: any) => {
  const url = `${mdmEAurl}/premium/segments/${facilityURN}`;

  const response = await axios({
    method: 'GET',
    url,
    auth: { username, password },
  }).catch((error: any) => error);
  if (response) {
    return response;
  }

  return new Error(`Error getting Premium schedule segments. Facility:${facilityURN}`);
};

export const getPremiumSchedule = async (req: Request, res: Response) => {
  const premiumScheduleParameters = req.body;

  const postPremiumScheduleResponse = await postPremiumSchedule(premiumScheduleParameters);

  if (!postPremiumScheduleResponse) {
    console.error('Error calling Premium schedule API', postPremiumScheduleResponse);
    return res.status(400).send();
  }

  if (postPremiumScheduleResponse === 200 || postPremiumScheduleResponse === 201) {
    const response = await getScheduleData(Number(premiumScheduleParameters.facilityURN));

    if (response.status === 200 || response.status === 201) {
      return res.status(response.status).send(response.data);
    }
  }

  return new Error(`Error calling Premium schedule. Facility:${premiumScheduleParameters.facilityURN}`);
};

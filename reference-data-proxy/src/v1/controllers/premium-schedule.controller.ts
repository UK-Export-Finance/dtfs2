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
  const premiumSchedulePayloadFormatted = premiumSchedulePayload;

  if (objectIsEmpty(premiumSchedulePayload) || premiumSchedulePayload.facilityURN === 'PENDING') {
    console.error('Unable to create premium schedule.', { premiumSchedulePayload });
    return null;
  }

  // Convert UKEF Facility ID to number else Mulesoft will throw 400
  if (premiumSchedulePayload.facilityURN) {
    premiumSchedulePayloadFormatted.facilityURN = Number(premiumSchedulePayload.facilityURN);
  }
  try {
    const response = await axios({
      method: 'post',
      url: `${mdmEAurl}/premium/schedule`,
      auth: { username, password },
      headers: {
        'Content-Type': 'application/json',
      },
      data: [premiumSchedulePayloadFormatted],
    }).catch((error: any) => {
      console.error(
        `Error calling POST Premium schedule with facilityURN: ${premiumSchedulePayloadFormatted.facilityURN} \n`,
        error.response.data,
        error.response.status,
      );
      return { data: error?.response?.data, status: error?.response?.status };
    });

    console.info(`Premium schedule successfully created for ${premiumSchedulePayloadFormatted.facilityURN}`);
    return response.status ? response.status : response;
  } catch (error) {
    console.error('Error calling POST Premium schedule in try catch', { error });
    return null;
  }
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

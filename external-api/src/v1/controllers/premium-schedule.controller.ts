// Premium Schedule API returns the premium schedule for a given facility
//
// the flow is:
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { objectIsEmpty } from '../../utils';
import { PremiumSchedule } from '../../interfaces';
dotenv.config();

const mdm: any = process.env.APIM_MDM_URL;
const headers: any = {
  'Content-Type': 'application/json',
  [String(process.env.APIM_MDM_KEY)]: process.env.APIM_MDM_VALUE,
};
const successStatus: Array<number> = [200, 201];

/**
 * Post premium schedule segments
 * @param {Array} premiumSchedulePayload PS entries
 * @returns Premium schedule segments
 */
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
      url: `${mdm}premium/schedule`,
      headers,
      data: [premiumSchedulePayloadFormatted],
    }).catch((error: any) => {
      console.error(
        `Error calling POST Premium schedule with facilityURN: ${premiumSchedulePayloadFormatted.facilityURN} \n`,
        error?.response?.data,
        error?.response?.status,
      );
      return { data: error?.response?.data, status: error?.response?.status };
    });

    console.info(`Premium schedule successfully created for ${premiumSchedulePayloadFormatted.facilityURN}`);
    return response.status ? response.status : response;
  } catch (error) {
    console.error('Error calling POST Premium schedule', { error });
    return null;
  }
};

/**
 * Get premium schedule segments from facility URN
 * @param {String} facilityId Facility ID
 * @returns {Array} Array of premium schedule segments
 */
const getScheduleData = async (facilityId: any) => {
  const url = `${mdm}premium/segments/${facilityId}`;

  const response = await axios({
    method: 'GET',
    url,
    headers,
  }).catch((error: any) => error);

  if (response) {
    return response;
  }

  return new Error(`Error getting Premium schedule segments. Facility:${facilityId}`);
};

/**
 * Get premium schedule segments from facility URN
 * @param {Express.Request} req Facility ID
 * @param {Express.Response} res Facility ID
 * @returns {Object} Premium schedule data
 */
export const getPremiumSchedule = async (req: Request, res: Response) => {
  const { 
    premiumTypeId, 
    premiumFrequencyId, 
    productGroup,
    facilityURN, 
    guaranteeCommencementDate, 
    guaranteeExpiryDate, 
    guaranteeFeePercentage, 
    guaranteePercentage, 
    dayBasis, 
    exposurePeriod, 
    maximumLiability, 
    cumulativeAmount 
  } = req.body;

  const premiumScheduleParameters: PremiumSchedule = {
    premiumTypeId,
    premiumFrequencyId,
    productGroup,
    facilityURN,
    guaranteeCommencementDate,
    guaranteeExpiryDate,
    guaranteeFeePercentage,
    guaranteePercentage,
    dayBasis,
    exposurePeriod,
    maximumLiability,
    cumulativeAmount,
  };

  const postPremiumScheduleResponse = await postPremiumSchedule(premiumScheduleParameters);

  if (!postPremiumScheduleResponse) {
    console.error('Error calling Premium schedule API', postPremiumScheduleResponse);
    return res.status(400).send();
  }

  if (successStatus.includes(postPremiumScheduleResponse)) {
    const response = await getScheduleData(Number(premiumScheduleParameters.facilityURN));

    if (successStatus.includes(response.status)) {
      return res.status(response.status).send(response.data);
    }
  }

  return new Error(`Error calling Premium schedule. Facility:${premiumScheduleParameters.facilityURN}`);
};

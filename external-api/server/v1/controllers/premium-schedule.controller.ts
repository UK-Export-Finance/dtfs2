/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Premium Schedule API returns the premium schedule for a given facility
// 1) Post parameters to Premium Schedule API, returns  header location to load the segments
// 2) Premium Schedule Segments gets the segments by facilityURN

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { HEADERS, UKEF_ID } from '@ukef/dtfs2-common';
import { PremiumSchedule } from '../../interfaces';
import { validUkefId, objectIsEmpty } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const successStatus: Array<number> = [200, 201];

export const premiumScheduleCalls = {
  /**
   * Post premium schedule segments
   * @param {Array} premiumSchedulePayload PS entries
   * @returns Premium schedule segments
   */
  postPremiumSchedule: async (premiumSchedulePayload: any) => {
    const premiumSchedulePayloadFormatted = premiumSchedulePayload;

    if (objectIsEmpty(premiumSchedulePayload) || premiumSchedulePayload.facilityURN === UKEF_ID.PENDING) {
      console.error('Unable to create premium schedule. %o', premiumSchedulePayload);
      return null;
    }

    // Convert UKEF Facility ID to number
    if (premiumSchedulePayload.facilityURN) {
      premiumSchedulePayloadFormatted.facilityURN = Number(premiumSchedulePayload.facilityURN);
    }
    try {
      const response = await axios({
        method: 'post',
        url: `${APIM_MDM_URL}v1/premium/schedule`,
        headers,
        data: [premiumSchedulePayloadFormatted],
      }).catch((error: any) => {
        console.error(
          'Error calling POST Premium schedule with facilityURN %s %o %s',
          premiumSchedulePayloadFormatted?.facilityURN,
          error?.response?.data,
          error?.response?.status,
        );
        return { data: 'Failed to POST premium schedule', status: error?.response?.status || 500 };
      });

      console.info('Premium schedule successfully created for %s', premiumSchedulePayloadFormatted.facilityURN);
      return response.status ? response.status : response;
    } catch (error) {
      console.error('Error calling POST Premium schedule %o', error);
      return null;
    }
  },
  /**
   * Get premium schedule segments from facility URN
   * @param {string} facilityId Facility ID
   * @returns {Array} Array of premium schedule segments
   */
  getScheduleData: async (facilityId: any) => {
    const url = `${APIM_MDM_URL}v1/premium/segments/${facilityId}`;

    const response = await axios({
      method: 'get',
      url,
      headers,
    }).catch((error: any) => error);

    if (response) {
      return response;
    }

    return new Error(`Error getting Premium schedule segments. Facility:${facilityId}`);
  },
};

/**
 * Get premium schedule segments from facility URN
 * @param {Express.Request} req Facility ID
 * @param {Express.Response} res Facility ID
 * @returns {object} Premium schedule data
 */
export const getPremiumSchedule = async (req: Request, res: Response) => {
  let premiumScheduleParameters = {} as PremiumSchedule;

  if (!objectIsEmpty(req.body)) {
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
      cumulativeAmount,
    } = req.body;

    premiumScheduleParameters = {
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
  }

  if (!premiumScheduleParameters?.facilityURN || !validUkefId(premiumScheduleParameters?.facilityURN.toString())) {
    console.error('Invalid facility URN %s', premiumScheduleParameters.facilityURN);
    return res.status(400).send({ status: 400, data: 'Invalid facility URN' });
  }

  const postPremiumScheduleResponse = await premiumScheduleCalls.postPremiumSchedule(premiumScheduleParameters);

  if (!postPremiumScheduleResponse) {
    console.error('Error calling Premium schedule API %o', postPremiumScheduleResponse);
    return res.status(400).send();
  }

  if (successStatus.includes(postPremiumScheduleResponse)) {
    const response = await premiumScheduleCalls.getScheduleData(Number(premiumScheduleParameters.facilityURN));

    if (successStatus.includes(response.status)) {
      return res.status(response.status).send(response.data);
    }
  }

  return new Error(`Error calling Premium schedule. Facility:${premiumScheduleParameters.facilityURN}`);
};

export default premiumScheduleCalls;

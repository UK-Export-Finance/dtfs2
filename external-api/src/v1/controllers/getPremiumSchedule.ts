/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Request, Response } from 'express';
import { PremiumSchedule } from '../../interfaces';
import { validUkefId, objectIsEmpty } from '../../helpers';
import { premiumScheduleCalls, successStatus } from './premium-schedule.controller';

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
    const response: any = await premiumScheduleCalls.getScheduleData(Number(premiumScheduleParameters.facilityURN));

    if (successStatus.includes(response.status)) {
      return res.status(response.status).send(response.data);
    }
  }

  return new Error(`Error calling Premium schedule. Facility:${premiumScheduleParameters.facilityURN}`);
};

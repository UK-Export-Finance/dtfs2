/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { HEADERS, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { PRODUCT_GROUP } from '../../constants';
import { isValidDate } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

const mapProductGroup = (facilityType: string) => {
  if (facilityType === FACILITY_TYPE.BOND) {
    return PRODUCT_GROUP.BOND;
  }

  if (facilityType === FACILITY_TYPE.LOAN) {
    return PRODUCT_GROUP.LOAN;
  }

  if (facilityType === FACILITY_TYPE.CASH) {
    // TODO: DTFS2-4633 - use correct product group.
    // TEMP whilst we don't know what product group to use for GEF.
    return PRODUCT_GROUP.LOAN;
  }

  if (facilityType === FACILITY_TYPE.CONTINGENT) {
    // TODO: DTFS2-4633 - use correct product group.
    // TEMP whilst we don't know what product group to use for GEF.
    return PRODUCT_GROUP.LOAN;
  }

  return null;
};

/**
Objective:
  The objective of the `getExposurePeriod` function is to calculate the exposure period in months between
  two dates provided and an optional product group. It makes a call to an external API and
  returns the exposure period in months with a status code or a `400` status code with an empty object as `data`.

Inputs:
  `req`: an Express request object
  `res`: an Express response object

Flow:
  1. Destructure `startDate`, `endDate`, and `facilityType` from `req.params`.
  2. Map `facilityType` to `productGroup` using the `mapProductGroup` function.
  3. Make a GET request to an external API with `startDate`, `endDate`, and `productGroup` as query parameters.
  4. If the response is falsy, return a `400` status code with an empty object as `data`.
  5. Destructure `status` and `data` from the response.
  6. Destructure `exposurePeriod` from `data`.
  7. Return the exposure period in months with a status code.

Outputs:
  `exposurePeriodInMonths`: the exposure period in months
  Status code

Additional aspects:
  The `mapProductGroup` function maps `facilityType` to `productGroup` based on predefined constants.
  The function uses the `axios` library to make a GET request to an external API.
  The function handles errors by returning a `400` status code with an empty object as `data`.
 */

/**
 * Calculates exposure period in months between two dates provided and
 * an optional product group
 * @param req Express request
 * @param res Express response
 * @returns Exposure period in months with status code,
 * otherwise `400` status code with empty object as `data`.
 */
export const getExposurePeriod = async (req: Request, res: Response) => {
  const { startDate, endDate, facilityType } = req.params;

  if (!isValidDate(startDate)) {
    console.error('Invalid start date provided %s', startDate);
    return res.status(400).send({ status: 400, data: 'Invalid date provided' });
  }

  if (!isValidDate(endDate)) {
    console.error('Invalid end date provided %s', endDate);
    return res.status(400).send({ status: 400, data: 'Invalid date provided' });
  }

  const productGroup = mapProductGroup(facilityType);

  console.info('Calling Exposure Period API');

  try {
    const response = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}v1/exposure-period?startdate=${startDate}&enddate=${endDate}&productgroup=${productGroup}`,
      headers,
    });

    if (!response) {
      return res.status(400).send({});
    }

    const { status, data } = response;
    const { exposurePeriod } = data;

    return res.status(status).send({
      exposurePeriodInMonths: exposurePeriod,
    });
  } catch (error) {
    console.error('Error calling Exposure Period API %o', error);
    return res.status(400).send({});
  }
};

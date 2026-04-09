/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
Objective:
  The objective of the `getByCompaniesHouseIndustryCode` function is to retrieve UKEF industry code data by calling an external API.
  The function handles the API response and returns the industry code data in the response.

Inputs:
  1. `req`: request object from Express
  2. `res`: response object from Express

Flow:
  1. Build API URL for UKEF industry code endpoint using `industryCode` parameter from `req.params`
  2. Call external API with `axios` and `headers`
  3. Handle errors and return response data or error message
  4. Return UKEF industry code data in response with appropriate status code

Outputs:
  1. Response with HTTP status code and UKEF industry code data

Additional aspects:
  1. The function uses `dotenv` to retrieve the MDM URL from environment variables
  2. The function logs information and errors to the console for debugging purposes
 */

import { Request, Response } from 'express';
import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Get a UKEF industry code by Companies House industry code.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const getByCompaniesHouseIndustryCode = async (req: Request, res: Response) => {
  try {
    const { industryCode } = req.params;

    console.info('⚡️ Invoking MDM UKEF industry code endpoint %s', industryCode);

    const url = `${APIM_MDM_URL}v2/ods/ukef-industry-code/by-companies-house-industry-code/${industryCode}`;

    const response = await axios({
      method: 'get',
      url,
      headers,
    }).catch((error: any) => {
      console.error('Error calling UKEF Industry Code API, %o', error);
      return {
        data: error.response?.data,
        status: error.response?.status,
      };
    });

    const { status, data } = response;

    if (status && status !== HttpStatusCode.Ok) {
      return res.status(status).send(data);
    }

    if (!response?.data) {
      throw new Error('void response received');
    }

    const { ukefIndustryCode } = data;

    console.info('✅ Successfully retrieved UKEF industry code data from MDM %s %s', industryCode, ukefIndustryCode);

    return res.status(status).send(data);
  } catch (error) {
    console.error('🚩 Error occurred during UKEF industry code endpoint call %o', error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during UKEF industry code endpoint call' });
  }
};

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
Objective:
  The objective of the `findAll` function is to retrieve all facility categories by calling an external API.
  The function handles the API response and returns the facility categories data in the response.

Inputs:
  1. `req`: request object from Express
  2. `res`: response object from Express

Flow:
  1. Build API URL for facility categories
  2. Call external API with `axios` and `headers`
  3. Handle errors and return response data or error message
  4. Return facility categories in response with appropriate status code

Outputs:
  1. Response with HTTP status code and facility categories data

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
 * Find all facility categories.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const findAll = async (req: Request, res: Response) => {
  try {
    console.info('⚡️ Invoking MDM facility categories endpoint');

    const url = `${APIM_MDM_URL}v2/ods/facility-categories`;

    const response = await axios({
      method: 'get',
      url,
      headers,
    }).catch((error: any) => {
      console.error('Error calling Facility Categories API, %o', error);
      return {
        data: error.response?.data,
        status: error.response?.status,
      };
    });

    if (!response?.data) {
      throw new Error('void response received');
    }

    const { status, data } = response;

    if (status !== HttpStatusCode.Ok) {
      return res.status(status).send(data);
    }

    console.info('✅ Successfully retrieved facility categories');

    return res.status(status).send(data);
  } catch (error) {
    console.error('🚩 Error occurred during facility categories endpoint call %o', error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during facility categories endpoint call' });
  }
};

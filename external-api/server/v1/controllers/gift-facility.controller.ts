/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
Objective:
  The objective of the `create` function is to create a GIFT facility by calling an external API.
  The function handles the API response and returns the GIFT facility data in the response.

Inputs:
  1. `req`: request object from Express
  2. `res`: response object from Express

Flow:
  1. Build API URL for GIFT facility creation
  2. Call external API with `axios` and `headers`
  3. Handle errors and return response data or error message
  4. Return GIFT facility data in response with appropriate status code

Outputs:
  1. Response with HTTP status code and GIFT facility data

Additional aspects:
  1. The function uses `dotenv` to retrieve the APIM TFS URL from environment variables
  2. The function logs information and errors to the console for debugging purposes
 */

import { Request, Response } from 'express';
import axios, { HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';

dotenv.config();

const { APIM_TFS_VALUE, APIM_TFS_KEY, APIM_TFS_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_TFS_KEY)]: APIM_TFS_VALUE,
};

/**
 * Create a GIFT facility.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const create = async (req: Request, res: Response) => {
  try {
    console.info('⚡️ Invoking APIM TFS GIFT facility endpoint');

    const url = `${APIM_TFS_URL}v2/gift/facility`;

    const response = await axios({
      method: 'post',
      url,
      headers,
      data: req.body,
    }).catch((error: any) => {
      console.error('Error calling APIM TFS GIFT facility endpoint %o', error);
      return {
        status: error.response?.status,
      };
    });

    const { status } = response;

    if (status !== HttpStatusCode.Created) {
      return res.sendStatus(status);
    }

    console.info('✅ Successfully created GIFT facility');

    return res.sendStatus(status);
  } catch (error: any) {
    console.error('Error calling APIM TFS GIFT facility endpoint %o', error);

    if (error?.response?.status) {
      return res.sendStatus(error.response.status);
    }

    console.error('🚩 Error occurred during GIFT facility endpoint call %o', error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during GIFT facility endpoint call' });
  }
};

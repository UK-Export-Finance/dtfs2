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
 * Get a GIFT facility.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const get = async (req: Request, res: Response) => {
  const { facilityId } = req.params;

  console.info('⚡️ Invoking APIM TFS GIFT - get facility %s endpoint', facilityId);

  try {
    const url = `${APIM_TFS_URL}v2/gift/facility/${facilityId}`;

    const response = await axios({
      method: 'GET',
      url,
      headers,
    }).catch((error: any) => {
      const status = error?.response?.status ?? HttpStatusCode.InternalServerError;

      const responseBody = error?.response?.data;

      console.error(
        'Error calling APIM TFS GIFT - get facility endpoint - facilityId %s status %s responseBody %o error %o',
        facilityId,
        status,
        responseBody,
        error,
      );

      return {
        status,
      };
    });

    const { status } = response;

    if (status !== HttpStatusCode.Ok && status !== HttpStatusCode.NotFound) {
      return res.sendStatus(status);
    }

    console.info('✅ Successfully obtained GIFT facility %s', facilityId);

    const responseData = 'data' in response ? response.data : undefined;

    return res.status(status).send(responseData);
  } catch (error: any) {
    console.error('Error calling APIM TFS GIFT - get facility %s endpoint %o', facilityId, error);

    if (error?.response?.status) {
      return res.sendStatus(error.response.status);
    }

    console.error('🚩 Error occurred during APIM TFS GIFT - get facility %s endpoint call %o', facilityId, error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: `Error occurred during APIM TFS GIFT - get facility ${facilityId} endpoint call` });
  }
};

/**
 * Get multiple GIFT facilities.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and per-facility statuses
 */
export const getMany = async (req: Request, res: Response) => {
  try {
    const facilityIdsQuery = req.query?.ids;

    const facilityIds = String(facilityIdsQuery ?? '')
      .split(',')
      .map((facilityId) => facilityId.trim())
      .filter(Boolean);

    const ids = facilityIds.join(',');

    console.info('⚡️ Invoking APIM TFS GIFT - get multiple facilities endpoint - ids %s', ids);

    if (!facilityIds.length) {
      return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, message: 'ids query parameter is required' });
    }

    const url = `${APIM_TFS_URL}v2/gift/facilities?ids=${ids}`;

    const response = await axios({
      method: 'GET',
      url,
      headers,
    }).catch((error: any) => {
      const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
      const responseBody = error?.response?.data;

      console.error('Error calling APIM TFS GIFT - get facilities endpoint - ids %s status %s responseBody %o error %o', ids, status, responseBody, error);

      return {
        status,
        data: responseBody,
      };
    });

    const responseData = 'data' in response ? response.data : {};

    return res.status(response.status).send(responseData);
  } catch (error: any) {
    console.error('Error calling APIM TFS GIFT - get facilities endpoint %o', error);

    if (error?.response?.status) {
      return res.sendStatus(error.response.status);
    }

    console.error('🚩 Error occurred during APIM TFS GIFT - get facilities endpoint call %o', error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during APIM TFS GIFT - get facilities endpoint call' });
  }
};

/**
 * Create a GIFT facility.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const create = async (req: Request, res: Response) => {
  const facilityId = req.body?.overview?.facilityId;

  try {
    console.info('⚡️ Invoking APIM TFS GIFT - create facility endpoint %s', facilityId);

    const url = `${APIM_TFS_URL}v2/gift/facility`;

    const response = await axios({
      method: 'POST',
      url,
      headers,
      data: req.body,
    }).catch((error: any) => {
      const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
      const responseBody = error?.response?.data ?? { message: 'No response received from APIM TFS GIFT - create facility endpoint' };

      console.error(
        'Error calling APIM TFS GIFT - create facility endpoint - facilityId %s status %s responseBody %o error %o',
        facilityId,
        status,
        responseBody,
        error,
      );

      return {
        status,
      };
    });

    const { status } = response;

    if (status !== HttpStatusCode.Accepted) {
      return res.sendStatus(status);
    }

    console.info('✅ Successfully created GIFT facility %s', facilityId);

    const responseData = 'data' in response ? response.data : undefined;

    return res.status(status).send(responseData);
  } catch (error: any) {
    console.error('Error calling APIM TFS GIFT - create facility endpoint for facility %s %o', facilityId, error);

    if (error?.response?.status) {
      return res.sendStatus(error.response.status);
    }

    console.error('🚩 Error occurred during APIM TFS GIFT - create facility endpoint call for facility %s %o', facilityId, error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during APIM TFS GIFT - create facility endpoint call' });
  }
};

/**
 * Amend a GIFT facility.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const amend = async (req: Request, res: Response) => {
  const { facilityId } = req.params;

  try {
    console.info('⚡️ Invoking APIM TFS GIFT - amend facility endpoint %s', facilityId);

    const url = `${APIM_TFS_URL}v2/gift/facility/${facilityId}/amendment`;

    const response = await axios({
      method: 'POST',
      url,
      headers,
      data: req.body,
    }).catch((error: any) => {
      const status = error?.response?.status ?? HttpStatusCode.InternalServerError;
      const responseBody = error?.response?.data ?? { message: 'No response received from APIM TFS GIFT - amend facility endpoint' };

      console.error(
        'Error calling APIM TFS GIFT - amend facility endpoint - facilityId %s status %s responseBody %o error %o',
        facilityId,
        status,
        responseBody,
        error,
      );

      return {
        status,
      };
    });

    const { status } = response;

    if (status !== HttpStatusCode.Accepted) {
      return res.sendStatus(status);
    }

    console.info('✅ Successfully amended GIFT facility');

    return res.status(status).send({
      success: true,
    });
  } catch (error: any) {
    console.error('Error calling APIM TFS GIFT - amend facility endpoint for facility %s %o', facilityId, error);

    if (error?.response?.status) {
      return res.sendStatus(error.response.status);
    }

    console.error('🚩 Error occurred during APIM TFS GIFT - amend facility endpoint call for facility %s %o', facilityId, error);

    return res
      .status(HttpStatusCode.InternalServerError)
      .send({ status: HttpStatusCode.InternalServerError, message: 'Error occurred during APIM TFS GIFT - amend facility endpoint call' });
  }
};

import axios, { AxiosError, HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

import { HEADERS, isValidCompanyRegistrationNumber } from '@ukef/dtfs2-common';

dotenv.config();

const { APIM_MDM_KEY, APIM_MDM_VALUE, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Get company details for the company matching the Companies House registration number provided.
 * @param {Request} req Express request with `registrationNumber` as a URL parameter.
 * @param {Response} res Express response.
 * @returns {Promise<Response>} Express response with `status` and `data`. `Data` contains the company details,
 * or error data if the request was unsuccessful.
 */
export const getCompanyByRegistrationNumber = async (req: Request, res: Response): Promise<Response> => {
  let response: { status: number | undefined; data: unknown };

  const { registrationNumber } = req.params;

  if (!isValidCompanyRegistrationNumber(registrationNumber)) {
    response = {
      status: HttpStatusCode.BadRequest,
      data: {
        error: 'Bad Request',
        statusCode: HttpStatusCode.BadRequest,
      },
    };
  } else {
    const url: string = `${APIM_MDM_URL}v1/companies?registrationNumber=${encodeURIComponent(registrationNumber)}`;

    response = await axios.get(url, { headers }).catch((error: AxiosError) => {
      console.error(`Error calling MDM API 'GET /companies?registrationNumber=': %o`, error);
      return { status: error.response?.status, data: error.response?.data };
    });
  }

  const { status, data } = response;

  return res.status(status || HttpStatusCode.InternalServerError).send(data);
};

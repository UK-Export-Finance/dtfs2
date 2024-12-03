import { CustomExpressRequest, HEADERS, isValidCompanyRegistrationNumber } from '@ukef/dtfs2-common';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  const { partyDbCompanyRegistrationNumber: companyReg } = req.params;

  if (!isValidCompanyRegistrationNumber(companyReg)) {
    console.error('Invalid company registration number provided %s', companyReg);
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
  }

  const response: { status: number; data: unknown } = await axios({
    method: 'get',
    url: `${APIM_MDM_URL}customers?companyReg=${companyReg}`,
    headers,
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Error calling Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;
  return res.status(status).send(data);
};

/**
 * Gets a customer in Salesforce, and creates it if it does not exist by sending a request to APIM,
 * based on the provided company registration number and company name.
 * This function validates the company registration number and sends an HTTP POST request to the MDM API
 * to get or create the party. If validation fails or an error occurs, it returns the appropriate HTTP status and error message.
 *
 * @param {CustomExpressRequest<{ reqBody: { companyName: string } }>} req - The Express request object, which contains:
 *   - `req.body` - The company name (`companyName`) and companies house number (`companyReg`).
 * @param {Response} res - The Express response object used to send the HTTP response.
 *
 * @returns {Promise<Response>} A promise that resolves to an HTTP response. The response contains:
 *   - On success: The status and data returned from the MDM API.
 *   - On failure: A relevant error message with the corresponding status code if there's an issue with the MDM request.
 *
 * @example
 * // Example usage:
 * const req = { body: { companyReg: '12345678', companyName: 'Test Corp' } };
 * const res = { status: () => res, send: () => {} };
 * await getOrCreateParty(req, res);
 */
export const getOrCreateParty = async (req: CustomExpressRequest<{ reqBody: { companyRegNo: string; companyName: string } }>, res: Response) => {
  const { companyRegNo, companyName } = req.body;
  console.log('asdfasdfasdf');
  console.log(companyRegNo);
  console.log(companyName);
  console.log(req.body);

  if (!isValidCompanyRegistrationNumber(companyRegNo)) {
    console.error('Invalid company registration number provided %s', companyRegNo);
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
  }

  if (!companyName) {
    console.error('No company name provided');
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company name' });
  }

  const response: { status: number; data: unknown } = await axios({
    method: 'post',
    url: `${APIM_MDM_URL}customers`,
    headers,
    data: {
      companyRegistrationNumber: companyRegNo,
      companyName,
    },
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Error calling Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

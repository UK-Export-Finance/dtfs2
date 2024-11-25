import { CustomExpressRequest, HEADERS, isAutomaticSalesforceCustomerCreationFeatureFlagEnabled, isValidCompanyRegistrationNumber } from '@ukef/dtfs2-common';
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
  const url = isAutomaticSalesforceCustomerCreationFeatureFlagEnabled()
    ? `${APIM_MDM_URL}customers/salesforce?companyRegistrationNumber=${companyReg}`
    : `${APIM_MDM_URL}customers?companyReg=${companyReg}`


  const response: { status: number; data: unknown } = await axios({
    method: 'get',
    url,
    headers,
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Error calling Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};


/**
 * Creates a new customer in Salesforce by sending a request to APIM,
 * based on the provided company registration number (from params) and company name (from the request body).
 * This function validates the company registration number and sends an HTTP POST request to the MDM API
 * to create the party. If validation fails or an error occurs, it returns the appropriate HTTP status and error message.
 *
 * @param {CustomExpressRequest<{ reqBody: { companyName: string } }>} req - The Express request object, which contains:
 *   - `req.params` - The company registration number (`companyRegNo`).
 *   - `req.body` - The company name (`companyName`).
 * @param {Response} res - The Express response object used to send the HTTP response.
 * 
 * @returns {Promise<Response>} A promise that resolves to an HTTP response. The response contains:
 *   - On success: The status and data returned from the MDM API.
 *   - On failure: An error message with the status `400` (Bad Request) if the company registration number is invalid, or a relevant error message with the corresponding status code if there's an issue with the MDM request.
 * 
 * @example
 * // Example usage:
 * const req = { params: { companyRegNo: '12345678' }, body: { companyName: 'Test Corp' } };
 * const res = { status: () => res, send: () => {} };
 * await createParty(req, res);
 */
export const createParty = async (req: CustomExpressRequest<{ reqBody: { partyDbCompanyRegistrationNumber: string, companyName: string } }>, res: Response) => {
  const { partyDbCompanyRegistrationNumber: companyReg, companyName } = req.body;

  if (!isValidCompanyRegistrationNumber(companyReg)) {
    console.error('Invalid company registration number provided %s', companyReg);
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
      companyReg,
      companyName,
    },
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Error calling Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

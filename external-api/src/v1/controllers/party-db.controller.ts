import { HEADERS, isValidCompanyRegistrationNumber } from '@ukef/dtfs2-common';
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
    url: `${APIM_MDM_URL}customers/direct?companyRegistrationNumber=${companyReg}`,
    headers,
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Failed to call Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

export const createParty = async (req: Request, res: Response) => {
  const { partyDbCompanyRegistrationNumber: companyReg } = req.params;

  if (!isValidCompanyRegistrationNumber(companyReg)) {
    console.error('Invalid company registration number provided %s', companyReg);
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid company registration number' });
  }

  const response: { status: number; data: unknown } = await axios({
    method: 'post',
    url: `${APIM_MDM_URL}customers`,
    headers,
    data: {
      companyRegistrationNumber: companyReg,
    },
  }).catch((error: AxiosError) => {
    console.error('Error calling Party DB API %o', error);
    return { data: 'Failed to call Party DB API', status: error?.response?.status || HttpStatusCode.InternalServerError };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

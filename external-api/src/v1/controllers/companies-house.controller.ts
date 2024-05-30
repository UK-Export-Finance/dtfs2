/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { isValidCompaniesHouseNumber } from '../../helpers';

dotenv.config();
const username: any = process.env.COMPANIES_HOUSE_API_KEY;
const companiesHouseURL: any = process.env.COMPANIES_HOUSE_API_URL;

export const lookup = async (req: Request, res: Response) => {
  const { companyRegistrationNumber }: any = req.params;
  const sanitisedRegNo: number = companyRegistrationNumber.padStart(8, '0');

  if (!isValidCompaniesHouseNumber(sanitisedRegNo.toString())) {
    console.error('Invalid company registration number %s', companyRegistrationNumber);
    return res.status(400).send({ status: 400, data: 'Invalid company registration number' });
  }

  const response = await axios({
    method: 'get',
    url: `${companiesHouseURL}/company/${sanitisedRegNo}`,
    auth: { username, password: '' },
  }).catch((error: any) => {
    console.error('Error calling Companies House API %o %s', error.response.data, error.response.status);
    return { data: error.response.data, status: error.response.status };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

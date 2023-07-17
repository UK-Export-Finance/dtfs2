import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { isValidCompaniesHouseNumber } from '../../utils/inputValidations';

dotenv.config();
const username: any = process.env.COMPANIES_HOUSE_API_KEY;
const companiesHouseURL: any = process.env.COMPANIES_HOUSE_API_URL;

export const lookup = async (req: Request, res: Response) => {
  const { companyRegistrationNumber }: any = req.params;
  const sanitisedRegNo: number = companyRegistrationNumber.padStart(8, '0');

  if (!isValidCompaniesHouseNumber(sanitisedRegNo.toString())) {
    console.error('Invalid company registration number: %s', companyRegistrationNumber);
    return res.status(400).send({ status: 400, data: 'Invalid company registration number' });
  }

  const response = await axios({
    method: 'get',
    url: `${companiesHouseURL}/company/${sanitisedRegNo}`,
    auth: { username, password: '' },
  }).catch((error: any) => {
    console.error('Error calling Companies House API', error.response.data, error.response.status);
    return { data: error.response.data, status: error.response.status };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

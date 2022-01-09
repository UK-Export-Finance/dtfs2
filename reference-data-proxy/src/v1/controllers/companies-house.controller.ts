import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const lookup = async (req: Request, res: Response) => {
  const { companyRegistrationNumber }: any = req.params;
  const sanitisedRegNo: number = companyRegistrationNumber.padStart(8, '0');
  const username: string = process.env.COMPANIES_HOUSE_API_KEY!;
  const companiesHouseURL: string = process.env.COMPANIES_HOUSE_API_URL!;

  const response = await axios({
    method: 'GET',
    url: `${companiesHouseURL}/company/${sanitisedRegNo}`,
    auth: { username, password: '' },
  }).catch((error: any) => {
    console.error('Error calling Companies House API', error.response);
    return error.response
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

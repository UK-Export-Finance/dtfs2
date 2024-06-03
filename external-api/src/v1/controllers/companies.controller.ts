import axios, { AxiosError } from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const { APIM_MDM_KEY, APIM_MDM_VALUE, APIM_MDM_URL } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const getCompanyByRegistrationNumber = async (req: Request, res: Response) => {
  const { registrationNumber } = req.params;

  const url: string = `${APIM_MDM_URL}companies?registrationNumber=${encodeURIComponent(registrationNumber)}`;

  const response: { status: number | undefined; data: unknown } = await axios.get(url, { headers }).catch((error: AxiosError) => {
    console.error(`Error calling MDM API 'GET /companies?registrationNumber=': %o`, error);
    return { status: error.response?.status, data: error.response?.data };
  });

  const { status, data } = response;

  return res.status(status || 500).send(data);
};

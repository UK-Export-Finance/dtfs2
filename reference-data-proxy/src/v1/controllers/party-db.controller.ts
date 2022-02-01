import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

const username: any = process.env.MULESOFT_API_PARTY_DB_KEY;
const password: any = process.env.MULESOFT_API_PARTY_DB_SECRET;
const partyDbURL: any = process.env.MULESOFT_API_PARTY_DB_URL;
export const lookup = async (req: Request, res: Response) => {
  const { partyDbCompanyRegistrationNumber } = req.params;

  const response = await axios({
    method: 'get',
    url: `${partyDbURL}/${partyDbCompanyRegistrationNumber}`,
    auth: { username, password },
  }).catch((error: any) => {
    console.error('Error calling Party DB API', error.response.data, error.response.status);
    return { data: error.response.data, status: error.response.status };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

import axios from 'axios';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

export const lookup = async (req: Request, res: Response) => {
  const { partyDbCompanyRegistrationNumber } = req.params;
  const username: string = process.env.MULESOFT_API_PARTY_DB_KEY!;
  const password: string = process.env.MULESOFT_API_PARTY_DB_SECRET!;
  const partyDbURL: string = process.env.MULESOFT_API_PARTY_DB_URL!;

  const response = await axios({
    method: 'GET',
    url: `${partyDbURL}/${partyDbCompanyRegistrationNumber}`,
    auth: { username, password },
  }).catch((error: any) => {
    console.error('Error calling Party DB API', error.response);
    return error.response;
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  try {
    const { partyDbCompanyRegistrationNumber: companyReg } = req.params;

    const response: { status: number; data: unknown } = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}customers?companyReg=${companyReg}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    const { status, data } = response;
    return res.status(status).send(data);
  } catch (error) {
    console.error('Unable to call lookup %o', error);
    return res.status(500).send({ status: 500, message: 'An unknown error occurred' });
  }
};

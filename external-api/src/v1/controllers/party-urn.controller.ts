import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Fetches company information from party URN
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {Object} Express response with `status` and `data`.
 */
export const lookup = async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;

    const response = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}customers?partyUrn=${urn}`,
      headers,
    }).catch((error: any) => {
      console.error('Error calling Party URN lookup', { error });
      return { data: error?.response?.data, status: error?.response?.status };
    });

    const { status, data } = response;

    return res.status(status).send(data);
  } catch (error) {
    console.error('Unable to lookup for company from party URN ', { error });
    return res.status(400);
  }
};

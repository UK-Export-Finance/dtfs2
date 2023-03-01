import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
dotenv.config();

const username: any = process.env.MULESOFT_API_PARTY_DB_KEY;
const password: any = process.env.MULESOFT_API_PARTY_DB_SECRET;
const partyDbURL: any = process.env.MULESOFT_API_PARTY_DB_URL;

/**
 * Fetches company information from party URN
 * @param {Object} req Express request
 * @param {Object} res Express response
 * @returns {Object} Express response with `status` and `data`.
 */
export const lookup = async (req: Request, res: Response) => {
  const { urn } = req.params;

  const response = await axios({
    method: 'get',
    url: `${partyDbURL}/find-customers?partyUrn=${urn}`,
    auth: { username, password },
  }).catch((error: any) => {
    console.error('Error calling Party URN lookup', { error });
    return { data: error?.response?.data, status: error?.response?.status };
  });

  const { status, data } = response;

  return res.status(status).send(data);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import axios from 'axios';
import * as dotenv from 'dotenv';
import { Request, Response } from 'express';
import { HEADERS } from '@ukef/dtfs2-common';
import { isValidPartyUrn } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Fetches company information from party URN
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @returns {object} Express response with `status` and `data`.
 */
export const lookup = async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;

    if (!isValidPartyUrn(urn)) {
      console.error('Invalid party URN provided %s', urn);
      return res.status(400).send({ status: 400, data: 'Invalid party URN' });
    }

    const response = await axios({
      method: 'get',
      url: `${APIM_MDM_URL}v1/customers?partyUrn=${urn}`,
      headers,
    }).catch((error: any) => {
      console.error('Error calling Party URN lookup %o', error);
      return { data: 'Failed to lookup for company from party URN', status: error?.response?.status || 500 };
    });

    const { status, data } = response;

    return res.status(status).send(data);
  } catch (error) {
    console.error('Unable to lookup for company from party URN %o', error);
    return res.status(400);
  }
};

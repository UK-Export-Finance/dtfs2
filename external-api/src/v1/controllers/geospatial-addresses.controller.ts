/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { isValidPostcode } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  'Content-Type': 'application/json',
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  const { postcode } = req.params;
  const noWhitespacePostcode = postcode.replace(' ', '');

  if (!isValidPostcode(noWhitespacePostcode)) {
    console.error('Invalid postcode %s', postcode);
    return res.status(400).send({ status: 400, data: 'Invalid postcode' });
  }

  console.info('Calling MDM Geospatial Addresses API %s', postcode);

  const response = await axios({
    method: 'get',
    url: `${APIM_MDM_URL}geospatial/addresses/postcode?postcode=${postcode}`,
    headers,
  }).catch((error: any) => {
    console.error('Error calling MDM Geospatial Addresses API %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to call Geospatial Addresses API' };
  });

  if (!response) {
    return res.status(400).send({});
  }

  const { status, data } = response;
  return res.status(status).send(data);
};

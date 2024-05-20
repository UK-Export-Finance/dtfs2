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
  const { OSPostcode } = req.params;
  const noWhitespacePostcode = OSPostcode.replace(' ', '');

  if (!isValidPostcode(noWhitespacePostcode)) {
    console.error('Invalid postcode %s', OSPostcode);
    return res.status(400).send({ status: 400, data: 'Invalid postcode' });
  }

  console.info('Calling MDM Ordnance Survey API %s', OSPostcode);

  const response = await axios({
    method: 'get',
    url: `${APIM_MDM_URL}geospatial/addresses/postcode?postcode=${OSPostcode}`,
    headers,
    timeout: 5000,
  }).catch((error: any) => {
    console.error('Error calling MDM Ordnance Survey API %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to call Ordnance Survey API' };
  });

  if (!response) {
    return res.status(400).send({});
  }

  const { status, data } = response;
  return res.status(status).send(data);
};

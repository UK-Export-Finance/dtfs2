/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios, { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { HEADERS } from '@ukef/dtfs2-common';
import { isValidPostcode } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

export const lookup = async (req: Request, res: Response) => {
  const { postcode } = req.params;
  const noWhitespacePostcode = postcode.replace(' ', '');

  if (!isValidPostcode(noWhitespacePostcode)) {
    console.error('Invalid postcode %s', postcode);
    return res.status(HttpStatusCode.BadRequest).send({ status: HttpStatusCode.BadRequest, data: 'Invalid postcode' });
  }

  console.info('Calling MDM Geospatial Addresses API %s', postcode);

  const response = await axios({
    method: 'get',
    url: `${APIM_MDM_URL}v1/geospatial/addresses/postcode?postcode=${postcode}`,
    headers,
  }).catch((error: any) => {
    console.error('Error calling MDM Geospatial Addresses API %o', error);
    return { status: error?.response?.status || HttpStatusCode.InternalServerError, data: 'Failed to call Geospatial Addresses API' };
  });

  if (!response) {
    console.error('MDM Geospatial Addresses API - empty response for postcode %s', postcode);
    return res.status(HttpStatusCode.BadRequest).send({});
  }

  const { status, data } = response;
  return res.status(status).send(data);
};

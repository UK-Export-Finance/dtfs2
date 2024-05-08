/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { isValidPostcode } from '../../helpers';

dotenv.config();

const ordnanceSurveyBaseUrl = process.env.ORDNANCE_SURVEY_API_URL;
const ordnanceSurveyApiKey = process.env.ORDNANCE_SURVEY_API_KEY;
export const lookup = async (req: Request, res: Response) => {
  const { OSPostcode } = req.params;
  const noWhitespacePostcode = OSPostcode.replace(' ', '');

  if (!isValidPostcode(noWhitespacePostcode)) {
    console.error('Invalid postcode %s', OSPostcode);
    return res.status(400).send({ status: 400, data: 'Invalid postcode' });
  }

  console.info('Calling Ordnance Survey API %s', OSPostcode);
  const url = `${ordnanceSurveyBaseUrl}/search/places/v1/postcode?postcode=${OSPostcode}&key=${ordnanceSurveyApiKey}`;
  const response = await axios({
    method: 'get',
    url,
  }).catch((error) => {
    console.error('Error calling Ordnance Survey API %o', error);
    return { status: error?.response?.status || 500, data: 'Failed to call Ordnance Survey API' };
  });

  const { status, data } = response;
  return res.status(status).send(data);
};

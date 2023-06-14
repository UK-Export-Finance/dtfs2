import axios from 'axios';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

const ordnanceSurveyBaseUrl = process.env.ORDNANCE_SURVEY_API_URL;
const ordnanceSurveyApiKey = process.env.ORDNANCE_SURVEY_API_KEY;
export const lookup = async (req: Request, res: Response) => {
  const { OSPostcode } = req.params;

  console.info('Calling Ordnance Survey API ', OSPostcode);
  const url = `${ordnanceSurveyBaseUrl}/search/places/v1/postcode?postcode=${OSPostcode}&key=${ordnanceSurveyApiKey}`;
  const response = await axios({
    method: 'get',
    url,
  }).catch((error) => {
    console.error('Error calling Ordnance Survey API', error?.response?.data);
    return error.response;
  });

  const { status, data } = response;
  return res.status(status).send(data);
};

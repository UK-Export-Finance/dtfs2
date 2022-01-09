import axios from 'axios';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const ordnanceSurveyBaseUrl = process.env.ORDNANCE_SURVEY_API_URL;
const ordnanceSurveyApiKey = process.env.ORDNANCE_SURVEY_API_KEY;

export const lookup = async (req: Request, res: Response) => {
  const { postcode } = req.params;

  console.log('Calling Ordnance Survey API');
  const url = `${ordnanceSurveyBaseUrl}/search/places/v1/postcode?postcode=${postcode}&key=${ordnanceSurveyApiKey}`;
  const response = await axios({
    method: 'get',
    url,
  }).catch((error: any) => {
    console.error('Error calling Ordnance Survey API', error.response);
    return error.response;
  });

  const { status, data } = response;
  return res.status(status).send(data);
};

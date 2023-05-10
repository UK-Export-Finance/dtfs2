import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const key: any = process.env.APIM_MDM_KEY;
const value: any = process.env.APIM_MDM_VALUE;
const exchangeRateURL: any = process.env.APIM_MDM_URL;

const headers = {
  [String(key)]: value,
};

export const getExchangeRate = async (req: Request, res: Response) => {
  const { source, target } = req.params;

  console.info(`Calling Exchange rate API - ${source} to ${target}`);

  // API does not support XYZ to GBP conversion so we have to reverse and calculate
  let actualSource = source;
  let actualTarget = target;

  if (source !== 'GBP' && target === 'GBP') {
    actualSource = 'GBP';
    actualTarget = source;
  }

  const response = await axios({
    method: 'get',
    url: `${exchangeRateURL}currencies/exchange?source=${actualSource}&target=${actualTarget}`,
    headers,
  }).catch((error: any) => {
    console.error('Error calling Exchange rate API, ', error.response.data, error.response.status);
    return { data: error.response.data, status: error.response.status };
  });

  const { status, data } = response;

  if (status !== 200) {
    return res.status(status).send(data);
  }

  const { midPrice } = data[0];

  const responseObj = { midPrice };

  // workaround for API not supporting XYZ to GBP conversion
  if (source !== 'GBP') {
    responseObj.midPrice = 1 / midPrice;
  }

  return res.status(status).send(responseObj);
};

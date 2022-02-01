import { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const getExchangeRate = async (req: Request, res: Response) => {
  const { source, target } = req.params;

  console.log(`Calling Exchange rate API - ${source} to ${target}`);

  // API does not support XYZ to GBP conversion so we have to reverse and calculate
  let actualSource = source;
  let actualTarget = target;

  if (source !== 'GBP' && target === 'GBP') {
    actualSource = 'GBP';
    actualTarget = source;
  }
  const username: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY;
  const password: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET;
  const exchangeRateURL: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL;

  const response = await axios({
    method: 'get',
    url: `${exchangeRateURL}?source=${actualSource}&target=${actualTarget}`,
    auth: { username, password },
  }).catch((catchErr: any) => {
    console.error('Error calling Exchange rate API', catchErr);
    return catchErr.response;
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

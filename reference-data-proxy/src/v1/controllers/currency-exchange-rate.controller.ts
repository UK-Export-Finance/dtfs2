import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const username: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY;
const password: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET;
const exchangeRateURL: any = process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_URL;

export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { source, target, date } = req.params;

    // API does not support XYZ to GBP conversion so we have to reverse and calculate
    let actualSource = source;
    let actualTarget = target;

    if (source !== 'GBP' && target === 'GBP') {
      actualSource = 'GBP';
      actualTarget = source;
    }

    const response = await axios({
      method: 'get',
      url: `${exchangeRateURL}?source=${actualSource}&target=${actualTarget}&exchangeRateDate=${date}`,
      auth: { username, password },
    }).catch((error: any) => {
      console.error('Error calling Exchange rate API, ', error?.response?.data, error?.response?.status);
      return { data: error?.response?.data, status: error?.response?.status };
    });

    const { status, data } = response;

    if (status !== 200) {
      return res.status(status).send(data);
    }

    const { midPrice } = data[0];

    const responseObj = {
      midPrice,
      historicExchangeRate: midPrice,
    };

    // workaround for API not supporting XYZ to GBP conversion
    if (source !== 'GBP') {
      responseObj.midPrice = 1 / (Math.round(midPrice * 100) / 100);
    }
    console.info(`Called Exchange rate API - ${source} to ${target} for ${date}: ${midPrice}`);
    return res.status(status).send(responseObj);
  } catch (e) {
    console.error('Error calling exchange rate API: ', { e });
    return res.status(400).send();
  }
};

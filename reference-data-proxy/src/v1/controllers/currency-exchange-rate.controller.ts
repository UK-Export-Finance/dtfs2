/**
Objective:
  The objective of the `getExchangeRate` function is to retrieve the exchange rate between
  two currencies from an external API and return it as a response to the client.
  It also allows an optional exchange rate date to be specified.

Inputs:
  - `req`: the request object containing the source and target currencies, and an optional exchange rate date
  - `res`: the response object to be sent back to the client

Flow:
  - Extract the source and target currencies from the request parameters
  - Check if an exchange rate date is specified and append it to the API URL if it exists
  - Make a GET request to the external API using Axios with the specified URL and headers
  - If the response data is empty, throw an error
  - If the response status is not 200, return the response data with the corresponding status code
  - Extract the midPrice from the response data and return it as an object with the key "exchangeRate"

Outputs:
  - A response object with the exchange rate between the source and target currencies
  - If an error occurs, a response object with a 400 status code

Additional aspects:
  - The function uses the Axios library to make HTTP requests to an external API
  - The API URL is retrieved from an environment variable using the `dotenv` library
  - The function logs information and errors to the console using `console.info` and `console.error`
 */

import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const key: any = process.env.APIM_MDM_KEY;
const value: any = process.env.APIM_MDM_VALUE;
const mdm: any = process.env.APIM_MDM_URL;

const headers = {
  [String(key)]: value,
};

/**
 * Get Exchange rate between `source` and `target` currency.
 * An optional `date` can also be specified in
 * a valid ISO 8601 date string format.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { source, target } = req.params;
    const date = req.params?.date ?? false;
    let url = `${mdm}currencies/exchange?source=${source}&target=${target}`;

    console.info(`⚡️ Invoking MDM currencies/exchange endpoint: ${source}:${target}`);

    if (date) {
      url = `${url}&exchangeRateDate=${date}`;
    }

    const response = await axios({
      method: 'get',
      url,
      headers,
    }).catch((error: any) => {
      console.error('Error calling Exchange rate API, ', error);
      return { data: error.response.data, status: error.response.status };
    });

    if (!response?.data) {
      throw new Error('void response received');
    }

    const { status, data } = response;

    if (status !== 200) {
      return res.status(status).send(data);
    }

    const { midPrice } = data[0];
    const exchange = { exchangeRate: midPrice };
    console.info(`✅ Exchange rate ${midPrice}`);

    return res.status(status).send(exchange);
  } catch (e) {
    console.error('🚩 Error occurred during currencies/exchange endpoint call: ', { e });
    return res.status(400);
  }
};

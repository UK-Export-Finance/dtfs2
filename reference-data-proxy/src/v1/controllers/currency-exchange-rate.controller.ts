/**
Objective:
  The objective of the getExchangeRate function is to call an external API to retrieve the exchange rate
  between two currencies and return the midPrice value. It also handles a specific case where the API
  does not support a certain conversion and requires a workaround.

Inputs:
  req: Request object from Express containing the source and target currencies as parameters.
  res: Response object from Express to send the response back to the client.

Flow:
  1. Extract the source and target currencies from the request parameters.
  2. Check if the API supports the conversion, if not, use a workaround to reverse the conversion.
  3. Call the external API using Axios with the appropriate parameters and headers.
  4. Handle any errors that may occur during the API call.
  5. Extract the midPrice value from the API response.
  6. If the source currency is not GBP, calculate the inverse of the midPrice value.
  7. Send the midPrice value or the inverse of it as the response to the client.

Outputs:
  midPrice value or the inverse of it as the response to the client.

Additional aspects:
  Uses Axios library to make HTTP requests to the external API.
  Uses dotenv library to retrieve the API URL from environment variables.
  Handles errors that may occur during the API call.
 */

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

/**
 * Get Exchange rate between `source` and `target` currency.
 * An optional `exchangeRateDate` can also be specified in
 * a valid ISO 8601 date string format.
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const getExchangeRate = async (req: Request, res: Response) => {
  const { source, target } = req.params;
  const exchangeRateDate = req.params?.exchangeRateDate ?? false;

  console.info(`Calling Exchange rate API - ${source} to ${target}`);

  // API does not support XYZ to GBP conversion so we have to reverse and calculate
  let actualSource = source;
  let actualTarget = target;
  let url = `${exchangeRateURL}currencies/exchange?source=${actualSource}&target=${actualTarget}`;

  if (source !== 'GBP' && target === 'GBP') {
    actualSource = 'GBP';
    actualTarget = source;
  }

  if (exchangeRateDate) {
    url = `${url}&exchangeRateDate=${exchangeRateDate}`;
  }

  const response = await axios({
    method: 'get',
    url,
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

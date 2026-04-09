/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

/**
Objective:
  The objective of the `getExchangeRate` function is to retrieve the exchange rate between two currencies, with an optional date parameter,
  by calling an external API. The function handles the conversion inversion for non-GBP source currencies and returns the exchange rate in the response.

Inputs:
  1. `req`: request object from Express
  2. `res`: response object from Express

Flow:
  1. Retrieve `source`, `target`, and `date` parameters from `req.params`
  2. Build API URL with `source` and `target` parameters
  3. If `source` is not `GBP`, convert to `GBP` and set `target` as `source`
  4. If `date` parameter is provided, add it to the API URL
  5. Call external API with `axios` and `headers`
  6. Handle errors and return response data or error message
  7. Calculate exchange rate and handle conversion inversion if necessary
  8. Return exchange rate in response with appropriate status code

Outputs:
  1. Response with HTTP status code and exchange rate data

Additional aspects:
  1. The function uses `dotenv` to retrieve the MDM URL from environment variables
  2. The function logs information and errors to the console for debugging purposes
 */

import { Request, Response } from 'express';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { CURRENCY, HEADERS } from '@ukef/dtfs2-common';
import { isValidCurrency, isValidDate } from '../../helpers';

dotenv.config();

const { APIM_MDM_VALUE, APIM_MDM_KEY, APIM_MDM_URL } = process.env;
const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  [String(APIM_MDM_KEY)]: APIM_MDM_VALUE,
};

/**
 * Get Exchange rate between `source` and `target` currency.
 * An optional `date` can also be specified in
 * a valid ISO 8601 date string format.
 * Please note, API only supports `GBP` as source
 * @param req request object
 * @param res response object
 * @returns response with HTTP status `code` and `data`
 */
export const getExchangeRate = async (req: Request, res: Response) => {
  try {
    const { source, target } = req.params;
    // This date parameter is only used for data migration
    // and is not used in production
    const date = req.params?.date ?? false;
    // TODO: centralised constants
    const { GBP } = CURRENCY;

    let sourceCurrency = source;
    let targetCurrency = target;

    console.info('⚡️ Invoking MDM currencies/exchange endpoint %s %s', sourceCurrency, targetCurrency);

    if (!isValidCurrency(source)) {
      console.error('Invalid currency provided %s', source);
      return res.status(400).send({ status: 400, data: 'Invalid currency provided' });
    }

    if (!isValidCurrency(target)) {
      console.error('Invalid currency provided %s', target);
      return res.status(400).send({ status: 400, data: 'Invalid currency provided' });
    }

    if (date && !isValidDate(date)) {
      console.error('Invalid date provided %s', date);
      return res.status(400).send({ status: 400, data: 'Invalid date provided' });
    }

    // Conversion inversion for non-GBP source
    if (source !== GBP) {
      sourceCurrency = GBP;
      targetCurrency = source;
    }

    let url = `${APIM_MDM_URL}v1/currencies/exchange?source=${sourceCurrency}&target=${targetCurrency}`;

    if (date) {
      url = `${url}&exchangeRateDate=${date}`;
    }

    const response = await axios({
      method: 'get',
      url,
      headers,
    }).catch((error: any) => {
      console.error('Error calling Exchange rate API, %o', error);
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

    // Conversion inversion for non-GBP source
    if (source !== GBP) {
      exchange.exchangeRate = Number(Number(1 / midPrice).toFixed(2));
    }

    console.info('✅ Exchange rate for %s %s is at %s', sourceCurrency, targetCurrency, exchange.exchangeRate);

    return res.status(status).send(exchange);
  } catch (error) {
    console.error('🚩 Error occurred during currencies/exchange endpoint call %o', error);
    return res.status(400);
  }
};

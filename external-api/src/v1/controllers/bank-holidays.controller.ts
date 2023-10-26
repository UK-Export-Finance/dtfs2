// Bank Holidays API returns the UK bank holidays from the Government API

import { Request, Response } from 'express';
import axios from 'axios';
import { BankHolidays } from '../../interfaces';
import { BANK_HOLIDAYS } from '../../external-api';

const bankHolidays: BankHolidays = BANK_HOLIDAYS;

/**
 * Get UK bank holidays
 * @returns Events for England & Wales, Scotland and Northern Ireland
 */

export const getBankHolidays = async (req: Request, res: Response) => {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://www.gov.uk/bank-holidays.json',
    });
    const { status, data } = response;

    if (status === 200 && !data.length) {
      return res.status(200).send(bankHolidays);
    }
    return res.status(200).send(data);
  } catch (error) {
    try {
      return res.status(200).send(bankHolidays);
    } catch (err) {
      console.error('Unable to get UK bank holidays %O', err);
      return res.status(500).send('Error getting UK bank holidays.');
    }
  }
};

// Bank Holidays API returns the UKE bank holidays from the Government API

import { Request, Response } from 'express';
import axios from 'axios';

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

    return res.status(200).send(response);
  } catch (error) {
    console.error('Unable to get UK bank holidays %O', error);
    return res.status(500).send('Error getting UK bank holidays.');
  }
};

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import axios from 'axios';
import { BANK_HOLIDAYS } from '../../external-api';

/**
 * Get UK bank holidays from gov API, if that fails returns data from backup external API
 * @returns Events for England & Wales, Scotland and Northern Ireland
 */
export const getBankHolidays = async (req: Request, res: Response) => {
  try {
    const { data } = await axios.get('https://www.gov.uk/bank-holidays.json');

    return res.status(200).send(data);
  } catch (error) {
    console.error('Unable to get get UK bank holidays from API, using static data instead:', error);
    return res.status(200).send(BANK_HOLIDAYS);
  }
};

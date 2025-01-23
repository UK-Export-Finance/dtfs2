import z from 'zod';
import { Currency } from '../types';
import { CURRENCY } from '../constants';

export const CURRENCY_SCHEMA = z.enum(Object.values(CURRENCY) as [Currency] & Currency[]);

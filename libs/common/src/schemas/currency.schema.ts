import z from 'zod';
import { Currency } from '@ukef/types';
import { CURRENCY } from '@ukef/constants';

export const CURRENCY_SCHEMA = z.enum(Object.values(CURRENCY) as [Currency] & Currency[]);

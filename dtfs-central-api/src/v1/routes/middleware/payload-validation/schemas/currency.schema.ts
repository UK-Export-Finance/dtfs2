import { CURRENCY } from '@ukef/dtfs2-common';
import z from 'zod';

/**
 * An array of acceptable currency values derived from the CURRENCY enum.
 * This array is used to validate if a given currency is acceptable.
 */
const acceptableCurrencies = Object.values(CURRENCY) as [keyof typeof CURRENCY];
export const CurrencySchema = z.enum(acceptableCurrencies);

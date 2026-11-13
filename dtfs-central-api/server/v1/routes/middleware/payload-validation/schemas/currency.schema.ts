import { ALL_CURRENCIES, CURRENCY } from '@ukef/dtfs2-common';
import zod from 'zod';

/**
 * An array of acceptable currency values derived from the CURRENCY enum.
 * This array is used to validate if a given currency is acceptable.
 */
const gefCurrencies = Object.values(CURRENCY) as [keyof typeof CURRENCY];
const allCurrencies = Object.values(ALL_CURRENCIES) as [keyof typeof ALL_CURRENCIES];

export const CurrencySchema = zod.enum(gefCurrencies);
export const AllCurrenciesSchema = zod.enum(allCurrencies);

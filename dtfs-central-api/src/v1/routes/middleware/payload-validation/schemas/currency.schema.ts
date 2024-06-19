import { CURRENCY, Currency } from '@ukef/dtfs2-common';
import z from 'zod';

export const CurrencySchema = z.enum(Object.values(CURRENCY) as [Currency, ...Currency[]]);

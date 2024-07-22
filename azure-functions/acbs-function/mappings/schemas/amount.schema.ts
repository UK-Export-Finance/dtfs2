import { z } from 'zod';
import { to2Decimals } from '../../helpers/currency';

export const AmountSchema = z.number().refine((amount) => to2Decimals(amount));

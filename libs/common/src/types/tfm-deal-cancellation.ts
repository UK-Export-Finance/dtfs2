import z from 'zod';
import { DEAL_CANCELLATION } from '../schemas/deal-cancellation';

export type TfmDealCancellation = z.infer<typeof DEAL_CANCELLATION>;

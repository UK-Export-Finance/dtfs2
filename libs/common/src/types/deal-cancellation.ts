import z from 'zod';
import { DEAL_CANCELLATION } from '../schemas/deal-cancellation';

export type TfmDealCancellationWithoutStatus = z.infer<typeof DEAL_CANCELLATION>;

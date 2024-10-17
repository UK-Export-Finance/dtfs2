import z from 'zod';
import { ObjectId } from 'mongodb';
import { DEAL_CANCELLATION } from '../schemas/deal-cancellation';

export type TfmDealCancellation = z.infer<typeof DEAL_CANCELLATION>;

export type TfmDealCancellationResponse = {
  cancelledDeal: { ukefDealId: string | ObjectId };
};

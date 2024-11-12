import z from 'zod';
import { DEAL_CANCELLATION } from '../schemas/deal-cancellation';
import { TfmDeal } from './mongo-db-models';

export type TfmDealCancellation = z.infer<typeof DEAL_CANCELLATION>;

export type TfmDealCancellationResponse = {
  cancelledDeal: TfmDeal;
  riskExpiredFacilityUkefIds: string[];
};

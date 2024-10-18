import { AuditDetails, TfmDealCancellation, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';

export class DealCancellationService {
  public static async cancelDeal(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: AuditDetails,
  ): Promise<TfmDealCancellationResponse | undefined> {
    const isDealCancellationPastOrPresent = new Date().valueOf() >= cancellation.effectiveFrom;

    if (isDealCancellationPastOrPresent) {
      return await TfmDealCancellationRepo.submitDealCancellation(dealId, cancellation, auditDetails);
    }

    // TODO DTFS2-7429: Handle future effective from dates
    return undefined;
  }
}

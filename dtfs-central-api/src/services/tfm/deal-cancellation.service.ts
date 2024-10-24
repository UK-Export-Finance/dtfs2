import { ACTIVITY_TYPES, InvalidAuditDetailsError, TfmActivity, TfmAuditDetails, TfmDealCancellation, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { TfmDealActivityRepo } from '../../repositories/tfm-deals-repo/tfm-deal-activity.repo';
import { TfmUsersRepo } from '../../repositories/tfm-users-repo';

export class DealCancellationService {
  public static async cancelDeal(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: TfmAuditDetails,
  ): Promise<TfmDealCancellationResponse | undefined> {
    const isDealCancellationPastOrPresent = new Date().valueOf() >= cancellation.effectiveFrom;

    let cancellationResponse: TfmDealCancellationResponse | undefined;
    const user = await TfmUsersRepo.findOneUserById(auditDetails.id);

    if (!user) {
      throw new InvalidAuditDetailsError("Supplied auditDetails 'id' does not correspond to a valid user");
    }

    if (isDealCancellationPastOrPresent) {
      cancellationResponse = await TfmDealCancellationRepo.submitDealCancellation(dealId, cancellation, auditDetails);
    }

    // TODO DTFS2-7429: Handle future effective from dates

    const activity: TfmActivity = {
      type: ACTIVITY_TYPES.CANCELLATION,
      timestamp: getUnixTime(new Date()),
      author: {
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id.toString(),
      },
      ...cancellation,
    };

    await TfmDealActivityRepo.addOneDealActivity(dealId, activity, auditDetails);

    return cancellationResponse;
  }
}

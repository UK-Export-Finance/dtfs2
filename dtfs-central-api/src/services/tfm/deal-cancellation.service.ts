import { ACTIVITY_TYPES, InvalidAuditDetailsError, TfmActivity, TfmAuditDetails, TfmDealCancellation, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { TfmUsersRepo } from '../../repositories/tfm-users-repo';

export class DealCancellationService {
  public static async cancelDeal(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: TfmAuditDetails,
  ): Promise<TfmDealCancellationResponse | undefined> {
    const isDealCancellationPastOrPresent = new Date().valueOf() >= cancellation.effectiveFrom;

    const user = await TfmUsersRepo.findOneUserById(auditDetails.id);

    if (!user) {
      throw new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`);
    }

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

    if (isDealCancellationPastOrPresent) {
      return await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, activity, auditDetails });
    }

    return await TfmDealCancellationRepo.scheduleDealCancellation({ dealId, cancellation, activity, auditDetails });
  }
}

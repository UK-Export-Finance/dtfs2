import {
  ACTIVITY_TYPES,
  DEAL_STATUS,
  InvalidAuditDetailsError,
  TfmActivity,
  TfmAuditDetails,
  TfmDealCancellation,
  TfmDealCancellationResponse,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { endOfDay, getUnixTime, isAfter, toDate } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { TfmUsersRepo } from '../../repositories/tfm-users-repo';
import { PortalDealService } from '../portal/update-deal-status.service';

export class DealCancellationService {
  public static async cancelDeal(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: TfmAuditDetails,
  ): Promise<TfmDealCancellationResponse> {
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
      const response = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, activity, auditDetails });

      const effectiveFromDate = toDate(cancellation.effectiveFrom);
      const endOfToday = endOfDay(new Date());

      const {
        cancelledDeal: {
          dealSnapshot: { dealType },
        },
      } = response;

      if (!isAfter(effectiveFromDate, endOfToday)) {
        await PortalDealService.updatePortalDealStatus({
          dealId,
          status: DEAL_STATUS.CANCELLED,
          auditDetails,
          dealType,
        });
      }

      return response;
    }

    return await TfmDealCancellationRepo.scheduleDealCancellation({ dealId, cancellation, activity, auditDetails });
  }
}

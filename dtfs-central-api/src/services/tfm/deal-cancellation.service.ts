import {
  ACTIVITY_TYPES,
  AuditDetails,
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
import { PortalDealService } from '../portal/deal.service';

export class DealCancellationService {
  /**
   * Submit a deal cancellation, either cancelling the deal or scheduling it for the
   * future depending on the effective date
   *
   * @param dealId The deal id to be cancelled
   * @param cancellation - the cancellation
   * @param auditDetails - the users audit details
   * @returns Tfm deal cancellation response
   */
  public static async cancelDeal(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: TfmAuditDetails,
  ): Promise<TfmDealCancellationResponse> {
    const effectiveFromDate = toDate(cancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const isDealCancellationInFuture = isAfter(effectiveFromDate, endOfToday);

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

    if (isDealCancellationInFuture) {
      return await TfmDealCancellationRepo.scheduleDealCancellation({ dealId, cancellation, activity, auditDetails });
    }

    const response = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, activity, auditDetails });

    const {
      cancelledDeal: {
        dealSnapshot: { dealType },
      },
    } = response;

    await PortalDealService.updateStatus({
      dealId,
      status: DEAL_STATUS.CANCELLED,
      auditDetails,
      dealType,
    });

    return response;
  }

  /**
   * Submit a scheduled deal cancellation
   * @param dealId The deal id to be cancelled
   * @param cancellation - the cancellation
   * @param auditDetails - the users audit details
   * @returns Tfm deal cancellation response
   */
  public static async submitScheduledCancellation(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: AuditDetails,
  ): Promise<TfmDealCancellationResponse> {
    const response = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, auditDetails });

    const {
      cancelledDeal: {
        dealSnapshot: { dealType },
      },
    } = response;

    await PortalDealService.updateStatus({
      dealId,
      status: DEAL_STATUS.CANCELLED,
      auditDetails,
      dealType,
    });

    return response;
  }
}

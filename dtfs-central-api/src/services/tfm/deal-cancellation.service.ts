import {
  ACTIVITY_TYPES,
  AuditDetails,
  DEAL_STATUS,
  FACILITY_STAGE,
  getUkefDealId,
  InvalidAuditDetailsError,
  TfmActivity,
  TfmAuditDetails,
  TfmDeal,
  TfmDealCancellation,
  TfmDealCancellationResponse,
  TfmFacility,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { endOfDay, getUnixTime, isAfter, toDate } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { TfmUsersRepo } from '../../repositories/tfm-users-repo';
import { PortalDealService } from '../portal/deal.service';
import { PortalFacilityRepo } from '../../repositories/portal/facilities.repo';

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
  public static async submitDealCancellation(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: TfmAuditDetails,
  ): Promise<TfmDealCancellationResponse> {
    const effectiveFromDate = toDate(cancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const dealCancellationIsInFuture = isAfter(effectiveFromDate, endOfToday);

    const user = await TfmUsersRepo.findOneUserById(auditDetails.id);

    if (!user) {
      throw new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`);
    }

    const author = {
      firstName: user.firstName,
      lastName: user.lastName,
      _id: user._id.toString(),
    };

    const activity: TfmActivity = {
      type: ACTIVITY_TYPES.CANCELLATION,
      timestamp: getUnixTime(new Date()),
      author,
      ...cancellation,
    };

    if (dealCancellationIsInFuture) {
      const { cancelledDeal, riskExpiredFacilities } = await TfmDealCancellationRepo.scheduleDealCancellation({
        dealId,
        cancellation,
        activity,
        auditDetails,
      });

      const {
        dealSnapshot: { dealType },
      } = cancelledDeal;

      await PortalDealService.updateStatus({
        dealId,
        newStatus: DEAL_STATUS.PENDING_CANCELLATION,
        auditDetails,
        dealType,
      });

      return this.getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities });
    }

    const { cancelledDeal, riskExpiredFacilities } = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, activity, auditDetails });

    const {
      dealSnapshot: { dealType, portalActivities },
    } = cancelledDeal;

    await PortalDealService.updateStatus({
      dealId,
      newStatus: DEAL_STATUS.CANCELLED,
      auditDetails,
      dealType,
    });

    await PortalFacilityRepo.updateManyByDealId(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);

    await PortalDealService.addDealCancelledActivity({ dealId, dealType, portalActivities, author, auditDetails });

    return this.getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities });
  }

  /**
   * Process a pending deal cancellation
   * @param dealId The deal id to be cancelled
   * @param cancellation - the cancellation
   * @param auditDetails - the users audit details
   * @returns Tfm deal cancellation response
   */
  public static async processPendingCancellation(
    dealId: ObjectId | string,
    cancellation: TfmDealCancellation,
    auditDetails: AuditDetails,
  ): Promise<TfmDealCancellationResponse> {
    const { cancelledDeal, riskExpiredFacilities } = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, auditDetails });

    const {
      dealSnapshot: { dealType },
    } = cancelledDeal;

    await PortalDealService.updateStatus({
      dealId,
      newStatus: DEAL_STATUS.CANCELLED,
      auditDetails,
      dealType,
    });

    await PortalFacilityRepo.updateManyByDealId(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);

    return this.getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities });
  }

  /**
   * Maps values returned by repository to return deal cancellation DTO
   *
   * @param repositoryResponse - The response from the deal cancellation repository method
   * @returns Tfm deal cancellation response DTO
   */
  public static getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities }: { cancelledDeal: TfmDeal; riskExpiredFacilities: TfmFacility[] }) {
    const cancelledDealUkefId = getUkefDealId(cancelledDeal.dealSnapshot) as string;

    return {
      cancelledDealUkefId,
      riskExpiredFacilityUkefIds: riskExpiredFacilities.map(({ facilitySnapshot }) => facilitySnapshot.ukefFacilityId as string),
    };
  }
}

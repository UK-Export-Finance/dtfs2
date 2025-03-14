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
  UKEF,
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
    console.info('Submitting deal cancellation for deal ID %s', dealId);

    const effectiveFrom = toDate(cancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const cancellationIsInFuture = isAfter(effectiveFrom, endOfToday);

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

    // If the deal cancellation effective date is in future
    if (cancellationIsInFuture) {
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

      await PortalDealService.addGefDealCancellationPendingActivity({
        dealId,
        dealType,
        author,
        auditDetails,
        effectiveFrom,
      });

      return this.getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities });
    }

    // If the deal cancellation effective date is either in past or present
    const { cancelledDeal, riskExpiredFacilities } = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, activity, auditDetails });

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

    await PortalDealService.addGefDealCancelledActivity({
      dealId,
      dealType,
      author,
      auditDetails,
      effectiveFrom,
    });

    return this.getTfmDealCancellationResponse({ cancelledDeal, riskExpiredFacilities });
  }

  /**
   * Process a pending deal cancellation
   * This is executed in a CRON job.
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
    console.info('Processing pending deal cancellation for deal ID %s', dealId);

    const { cancelledDeal, riskExpiredFacilities } = await TfmDealCancellationRepo.submitDealCancellation({ dealId, cancellation, auditDetails });

    const {
      dealSnapshot: { dealType },
    } = cancelledDeal;

    const effectiveFrom = toDate(cancellation.effectiveFrom);

    await PortalDealService.updateStatus({
      dealId,
      newStatus: DEAL_STATUS.CANCELLED,
      auditDetails,
      dealType,
    });

    await PortalFacilityRepo.updateManyByDealId(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);

    /**
     * NOTE: Because this is executed during a CRON job,
     * there is no user data.
     * Therefore, we set the author with a simple UKEF name.
     */
    const author = {
      firstName: UKEF.ACRONYM,
    };

    await PortalDealService.addGefDealCancelledActivity({
      dealId,
      dealType,
      author,
      auditDetails,
      effectiveFrom,
    });

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

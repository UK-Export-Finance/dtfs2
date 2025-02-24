import { AuditDetails, ActivityAuthor, DEAL_TYPE, DealStatus, DealType, PORTAL_ACTIVITY_LABEL, UKEF, getLongDateFormat, now } from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';
import { PortalActivityRepo } from '../../repositories/portal/portal-activity.repo';

export class PortalDealService {
  /**
   * Updates the deal status
   * @param updateStatusParams
   * @param updateStatusParams.dealId - the deal Id to update
   * @param updateStatusParams.newStatus - the status change to make
   * @param updateStatusParams.auditDetails - the users audit details
   * @param updateStatusParams.dealType - the deal type
   */
  public static async updateStatus({
    dealId,
    newStatus,
    auditDetails,
    dealType,
  }: {
    dealId: ObjectId | string;
    newStatus: DealStatus;
    auditDetails: AuditDetails;
    dealType: DealType;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      await updateGefDealStatus({
        dealId,
        newStatus,
        auditDetails,
      });
    } else if (dealType === DEAL_TYPE.BSS_EWCS) {
      await updateBssEwcsDealStatus({
        dealId,
        newStatus,
        auditDetails,
      });
    } else {
      throw new Error(`Invalid dealType ${dealType}`);
    }
  }

  /**
   * Adds a GEF deal cancelled activity to the portal activity repository.
   * This function is executed for a future deal cancellation
   * effective date.
   *
   * @param {Object} params - The parameters for adding the activity.
   * @param {ObjectId | string} params.dealId - The ID of the deal.
   * @param {DealType} params.dealType - The type of the deal.
   * @param {ActivityAuthor} params.author - The author of the activity.
   * @param {AuditDetails} params.auditDetails - The audit details for the activity.
   * @param {Date} params.effectiveFrom - The date from which the cancellation is effective.
   *
   * @returns {Promise<void>} A promise that resolves when the activity is added.
   */
  public static async addGefDealCancellationPendingActivity({
    dealId,
    dealType,
    author,
    auditDetails,
    effectiveFrom,
  }: {
    dealId: ObjectId | string;
    dealType: DealType;
    author: ActivityAuthor;
    auditDetails: AuditDetails;
    effectiveFrom: Date;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      const newActivity = {
        label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED,
        text: `Date effective from: ${getLongDateFormat(effectiveFrom)}`,
        scheduledCancellation: true,
        timestamp: getUnixTime(now()),
        author: {
          _id: author._id,
          firstName: UKEF.ACRONYM,
        },
      };

      await PortalActivityRepo.addPortalActivity(dealId, newActivity, auditDetails);
    }
  }

  /**
   * Adds a GEF deal cancelled activity to the portal activity repository.
   * This function is executed either for a present or a past deal cancellation
   * effective date.
   *
   * @param {Object} params - The parameters for adding the activity.
   * @param {ObjectId | string} params.dealId - The ID of the deal.
   * @param {DealType} params.dealType - The type of the deal.
   * @param {ActivityAuthor} params.author - The author of the activity.
   * @param {AuditDetails} params.auditDetails - The audit details for the activity.
   * @param {Date} params.effectiveFrom - The date from which the cancellation is effective.
   *
   * @returns {Promise<void>} A promise that resolves when the activity is added.
   */
  public static async addGefDealCancelledActivity({
    dealId,
    dealType,
    author,
    auditDetails,
    effectiveFrom,
  }: {
    dealId: ObjectId | string;
    dealType: DealType;
    author: ActivityAuthor;
    auditDetails: AuditDetails;
    effectiveFrom: Date;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      const newActivity = {
        label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
        text: `Date effective from: ${getLongDateFormat(effectiveFrom)}`,
        timestamp: getUnixTime(new Date()),
        author: {
          _id: author._id,
          firstName: UKEF.ACRONYM,
        },
      };

      await PortalActivityRepo.addPortalActivity(dealId, newActivity, auditDetails);
    }
  }
}

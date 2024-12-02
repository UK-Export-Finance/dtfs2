import { Activity, AuditDetails, ActivityAuthor, DEAL_TYPE, DealStatus, DealType, PORTAL_ACTIVITY_LABEL, PORTAL_ACTIVITY_TYPE } from '@ukef/dtfs2-common';
import { getUnixTime } from 'date-fns';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';
import { updateDeal } from '../../v1/controllers/portal/gef-deal/update-deal';

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
   * Add a "GEF deal cancelled" activity
   * @param addGefDealCancelledActivityParams
   * @param addGefDealCancelledActivityParams.dealId - the deal Id to update
   * @param addGefDealCancelledActivityParams.dealType - the deal type
   * @param addGefDealCancelledActivityParams.portalActivities - previous/existing deal activities
   * @param addGefDealCancelledActivityParams.author - the activity's author
   * @param addGefDealCancelledActivityParams.auditDetails - the users audit details
   */
  public static async addGefDealCancelledActivity({
    dealId,
    dealType,
    portalActivities,
    author,
    auditDetails,
  }: {
    dealId: ObjectId | string;
    dealType: DealType;
    portalActivities: Array<Activity>;
    author: ActivityAuthor;
    auditDetails: AuditDetails;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      const newActivity = {
        type: PORTAL_ACTIVITY_TYPE.DEAL_CANCELLED,
        timestamp: getUnixTime(new Date()),
        author: {
          _id: author._id,
          firstName: 'UKEF',
        },
        label: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
        html: PORTAL_ACTIVITY_LABEL.DEAL_CANCELLED,
      };

      const update = {
        portalActivities: [newActivity, ...portalActivities],
      };

      await updateDeal({ dealId, dealUpdate: update, auditDetails });
    }
  }
}

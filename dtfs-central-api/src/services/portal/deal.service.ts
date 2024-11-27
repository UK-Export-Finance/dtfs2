import { Activity, AuditDetails, ActivityAuthor, DEAL_TYPE, DealStatus, DealType } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';
import { addGefDealCancelledActivity } from '../../v1/controllers/portal/gef-deal/add-gef-deal-cancelled-activity';

export class PortalDealService {
  /**
   * Updates the deal status
   *
   * @param updateStatus
   * @param updateStatus.dealId - the deal Id to update
   * @param updateStatus.newStatus - the status change to make
   * @param updateStatus.auditDetails - the users audit details
   * @param updateStatus.dealType - the deal type
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
   * Add a "deal cancelled" activity
   *
   * @param addDealCancelledActivity
   * @param addDealCancelledActivity.dealId - the deal Id to update
   * @param addDealCancelledActivity.dealType - the deal type
   * @param addDealCancelledActivity.portalActivities - previous/existing deal activities
   * @param addDealCancelledActivity.author - the activity's author
   * @param addDealCancelledActivity.auditDetails - the users audit details
   */
  public static async addDealCancelledActivity({
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
      await addGefDealCancelledActivity({ dealId, portalActivities, author, auditDetails });
    }
  }
}

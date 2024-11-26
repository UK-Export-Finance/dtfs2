import { Activity, AuditDetails, ActivityAuthor, DEAL_TYPE, DealStatus, DealType } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';
import { addGefDealCancelledActivity } from '../../v1/controllers/portal/gef-deal/add-gef-deal-cancelled-activity.controller';

export class PortalDealService {
  /**
   * Updates the deal status
   *
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
    } else {
      throw new Error(`Invalid dealType ${dealType}`);
    }
  }
}

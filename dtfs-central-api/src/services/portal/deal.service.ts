import { AuditDetails, DEAL_TYPE, DealStatus, DealType } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';

export class PortalDealService {
  /**
   * Updates the deal status
   *
   * @param updateStatusParams
   * @param updateStatusParams.dealId - the deal Id to update
   * @param updateStatusParams.status - the status change to make
   * @param updateStatusParams.auditDetails - the users audit details
   * @param updateStatusParams.dealType - the deal type
   */
  public static async updateStatus({
    dealId,
    status,
    auditDetails,
    dealType,
  }: {
    dealId: ObjectId | string;
    status: DealStatus;
    auditDetails: AuditDetails;
    dealType: DealType;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      await updateGefDealStatus({
        dealId,
        status,
        auditDetails,
      });
    } else if (dealType === DEAL_TYPE.BSS_EWCS) {
      await updateBssEwcsDealStatus({
        dealId,
        status,
        auditDetails,
      });
    } else {
      throw new Error(`Invalid dealType ${dealType}`);
    }
  }
}

import { DEAL_TYPE, DealStatus, DealType, TfmAuditDetails } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import * as BssEwcsStatusController from '../../v1/controllers/portal/deal/update-deal-status.controller';
import * as GefStatusController from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';

export class PortalDealService {
  public static async updatePortalDealStatus(dealId: ObjectId | string, status: DealStatus, auditDetails: TfmAuditDetails, dealType: DealType): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      await GefStatusController.updateDealStatus({
        dealId,
        newStatus: status,
        auditDetails,
      });
    } else {
      await BssEwcsStatusController.updateDealStatus({
        dealId,
        status,
        auditDetails,
      });
    }
  }
}

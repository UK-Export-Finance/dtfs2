import { AuditDetails, DEAL_TYPE, DealStatus, DealType } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { updateBssEwcsDealStatus } from '../../v1/controllers/portal/deal/update-deal-status.controller';
import { updateGefDealStatus } from '../../v1/controllers/portal/gef-deal/put-gef-deal.status.controller';

export class PortalDealService {
  public static async updatePortalDealStatus({
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
    } else {
      await updateBssEwcsDealStatus({
        dealId,
        status,
        auditDetails,
      });
    }
  }
}

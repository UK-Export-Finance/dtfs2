import { AuditDetails, DEAL_TYPE, DealType, FacilityStatus } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { PortalBssEwcsFacilityRepo } from '../../repositories/portal/bss-ewcs-facilities.repo';
import { PortalGefFacilityRepo } from '../../repositories/portal/gef-facilities.repo';

export class PortalFacilityService {
  /**
   * Updates the status on all facilities associated with a deal
   *
   * @param updateStatusParams
   * @param updateStatusParams.dealId - the deal Id
   * @param updateStatusParams.status - the status change to make
   * @param updateStatusParams.auditDetails - the users audit details
   * @param updateStatusParams.dealType - the deal type
   */
  public static async updateStatusByDealId({
    dealId,
    status,
    auditDetails,
    dealType,
  }: {
    dealId: ObjectId | string;
    status: FacilityStatus;
    auditDetails: AuditDetails;
    dealType: DealType;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      await PortalGefFacilityRepo.updateByDealId(dealId, { status }, auditDetails);
    } else if (dealType === DEAL_TYPE.BSS_EWCS) {
      await PortalBssEwcsFacilityRepo.updateStatusByDealId(dealId, status, auditDetails);
    } else {
      throw new Error(`Invalid dealType ${dealType}`);
    }
  }
}

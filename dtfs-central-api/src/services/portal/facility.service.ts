import { AuditDetails, DEAL_TYPE, DealType, FacilityStatus } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { updateFacilityStatus } from '../../v1/controllers/portal/facility/update-facility-status.controller';
import { updateFacility } from '../../v1/controllers/portal/gef-facility/update-facility.controller';

export class PortalFacilityService {
  /**
   * Updates the facility status
   *
   * @param updateStatusParams
   * @param updateStatusParams.facilityId - the facility Id to update
   * @param updateStatusParams.status - the status change to make
   * @param updateStatusParams.auditDetails - the users audit details
   * @param updateStatusParams.dealType - the deal type
   */
  public static async updateStatus({
    facilityId,
    status,
    auditDetails,
    dealType,
  }: {
    facilityId: ObjectId | string;
    status: FacilityStatus;
    auditDetails: AuditDetails;
    dealType: DealType;
  }): Promise<void> {
    if (dealType === DEAL_TYPE.GEF) {
      await updateFacility({ facilityId, facilityUpdate: { status }, auditDetails });
    } else if (dealType === DEAL_TYPE.BSS_EWCS) {
      await updateFacilityStatus({
        facilityId,
        status,
        auditDetails,
      });
    } else {
      throw new Error(`Invalid dealType ${dealType}`);
    }
  }
}

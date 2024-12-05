import { AMENDMENT_STATUS, AMENDMENT_TYPES, InvalidAuditDetailsError, PortalAuditDetails, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId, UpdateResult } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { findOneUser } from '../../v1/controllers/user/get-user.controller';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';

export class PortalFacilityAmendmentService {
  /**
   * Updates the deal status
   *
   * @param updateStatusParams
   * @param updateStatusParams.dealId - the deal Id to update
   * @param updateStatusParams.newStatus - the status change to make
   * @param updateStatusParams.auditDetails - the users audit details
   * @param updateStatusParams.dealType - the deal type
   */
  public static async upsertPortalFacilityAmendmentDraft({
    dealId,
    facilityId,
    amendment,
    auditDetails,
  }: {
    dealId: string;
    facilityId: string;
    amendment: PortalFacilityAmendment;
    auditDetails: PortalAuditDetails;
  }): Promise<UpdateResult> {
    const user = await findOneUser(auditDetails.id);

    if (!user || `status` in user) {
      throw new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`);
    }

    const amendmentToInsert: PortalFacilityAmendment = {
      ...amendment,
      dealId: new ObjectId(dealId),
      facilityId: new ObjectId(facilityId),
      amendmentId: new ObjectId(),
      type: AMENDMENT_TYPES.PORTAL,
      status: AMENDMENT_STATUS.IN_PROGRESS,
      createdAt: getUnixTime(new Date()),
      updatedAt: getUnixTime(new Date()),
      createdBy: {
        username: user.username,
        name: `${user.firstname} ${user.surname}`,
        email: user.email,
      },
    };

    return await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendmentToInsert, auditDetails);
  }
}

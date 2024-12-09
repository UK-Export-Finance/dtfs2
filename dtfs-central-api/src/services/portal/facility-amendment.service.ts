import { AMENDMENT_STATUS, AMENDMENT_TYPES, InvalidAuditDetailsError, PortalAuditDetails, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { fromUnixTime, getUnixTime } from 'date-fns';
import { findOneUser } from '../../v1/controllers/user/get-user.controller';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';
import { PutPortalFacilityAmendmentPayload } from '../../v1/routes/middleware/payload-validation/validate-put-portal-facility-amendment-payload';

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
    amendment: PutPortalFacilityAmendmentPayload['amendment'];
    auditDetails: PortalAuditDetails;
  }): Promise<PortalFacilityAmendment> {
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
      version: 0,
      facilityEndDate: amendment.facilityEndDate ? fromUnixTime(amendment.facilityEndDate) : undefined,
      bankReviewDate: amendment.bankReviewDate ? fromUnixTime(amendment.bankReviewDate) : undefined,
    };

    await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendmentToInsert, auditDetails);

    return amendmentToInsert;
  }
}

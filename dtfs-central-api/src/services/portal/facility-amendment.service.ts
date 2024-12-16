import { AMENDMENT_STATUS, AMENDMENT_TYPES, InvalidAuditDetailsError, PortalAuditDetails, PortalFacilityAmendment } from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { getUnixTime } from 'date-fns';
import { findOneUser } from '../../v1/controllers/user/get-user.controller';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';
import { PutPortalFacilityAmendmentPayload } from '../../v1/routes/middleware/payload-validation/validate-put-portal-facility-amendment-payload';
import { PatchPortalFacilityAmendmentPayload } from '../../v1/routes/middleware/payload-validation/validate-patch-portal-facility-amendment-payload';

export class PortalFacilityAmendmentService {
  /**
   * Upserts the portal amendment draft on a facility
   *
   * @param updateStatusParams
   * @param updateStatusParams.dealId - the deal Id the facility exists on
   * @param updateStatusParams.facilityId - the facility Id the amendment is for
   * @param updateStatusParams.amendment - the amendment to upsert
   * @param updateStatusParams.auditDetails - the users audit details
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
    };

    await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendmentToInsert, auditDetails);

    return amendmentToInsert;
  }

  public static async updatePortalFacilityAmendment({
    amendmentId,
    facilityId,
    update,
    auditDetails,
  }: {
    amendmentId: string;
    facilityId: string;
    update: PatchPortalFacilityAmendmentPayload['update'];
    auditDetails: PortalAuditDetails;
  }): Promise<void> {
    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      ...update,
      updatedAt: getUnixTime(new Date()),
    };

    await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({ amendmentId, facilityId, update: amendmentUpdate, auditDetails });
  }
}

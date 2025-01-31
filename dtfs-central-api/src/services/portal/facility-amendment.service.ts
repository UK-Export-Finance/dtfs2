import {
  AMENDMENT_TYPES,
  FacilityAmendmentWithUkefId,
  getUnixTimestampSeconds,
  InvalidAuditDetailsError,
  PortalAuditDetails,
  PortalFacilityAmendment,
  PortalFacilityAmendmentUserValues,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { findOneUser } from '../../v1/controllers/user/get-user.controller';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';
import { EligibilityCriteriaAmendmentsRepo } from '../../repositories/portal/eligibility-criteria-amendments.repo';
import { findOneFacility } from '../../v1/controllers/portal/facility/get-facility.controller';

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
    amendment: PortalFacilityAmendmentUserValues;
    auditDetails: PortalAuditDetails;
  }): Promise<PortalFacilityAmendment> {
    const user = await findOneUser(auditDetails.id);

    if (!user || `status` in user) {
      throw new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`);
    }

    const { type: facilityType } = await findOneFacility(facilityId);

    const { version, criteria } = await EligibilityCriteriaAmendmentsRepo.findLatestEligibilityCriteria(facilityType);

    const updatedCriteria = criteria.map((criterion) => ({ ...criterion, answer: null }));

    const amendmentToInsert: PortalFacilityAmendment = {
      ...amendment,
      dealId: new ObjectId(dealId),
      facilityId: new ObjectId(facilityId),
      amendmentId: new ObjectId(),
      type: AMENDMENT_TYPES.PORTAL,
      status: PORTAL_AMENDMENT_STATUS.DRAFT,
      createdAt: getUnixTimestampSeconds(new Date()),
      updatedAt: getUnixTimestampSeconds(new Date()),
      eligibilityCriteria: { version, criteria: updatedCriteria },
      createdBy: {
        username: user.username,
        name: `${user.firstname} ${user.surname}`,
        email: user.email,
      },
    };

    await TfmFacilitiesRepo.upsertPortalFacilityAmendmentDraft(amendmentToInsert, auditDetails);

    return amendmentToInsert;
  }

  /**
   * Updates a portal facility amendment with the provided details.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
   * @param params.update - The update payload for the amendment.
   * @param params.auditDetails - The audit details for the update operation.
   * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAmendmentWithUkefId)>} A promise that resolves when the update operation is complete.
   */
  private static async updatePortalFacilityAmendment({
    amendmentId,
    facilityId,
    update,
    auditDetails,
  }: {
    amendmentId: ObjectId;
    facilityId: ObjectId;
    update: Partial<PortalFacilityAmendment>;
    auditDetails: PortalAuditDetails;
  }): Promise<FacilityAmendmentWithUkefId> {
    await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({
      amendmentId,
      facilityId,
      update,
      auditDetails,
    });

    const updatedAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (updatedAmendment?.type !== AMENDMENT_TYPES.PORTAL) {
      throw new Error(`Could not find amendment to return`);
    }

    return updatedAmendment;
  }

  /**
   * Updates a portal facility amendment with the provided details.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
   * @param params.update - The update payload for the amendment.
   * @param params.auditDetails - The audit details for the update operation.
   * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAmendmentWithUkefId)>} A promise that resolves when the update operation is complete.
   */
  public static async updatePortalFacilityAmendmentUserValues({
    amendmentId,
    facilityId,
    update,
    auditDetails,
  }: {
    amendmentId: string;
    facilityId: string;
    update: PortalFacilityAmendmentUserValues;
    auditDetails: PortalAuditDetails;
  }): Promise<FacilityAmendmentWithUkefId> {
    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      ...update,
      updatedAt: getUnixTimestampSeconds(new Date()),
    };

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    return await this.updatePortalFacilityAmendment({ amendmentId: amendmentMongoId, facilityId: facilityMongoId, update: amendmentUpdate, auditDetails });
  }

  /**
   * Updates portal facility amendment status to `Ready for checker's approval`.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
   * @param params.dealId - The deal id
   * @param params.auditDetails - The audit details for the update operation.
   * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAmendmentWithUkefId)>} A promise that resolves when the update operation is complete.
   */
  public static async submitPortalFacilityAmendmentToChecker({
    amendmentId,
    facilityId,
    auditDetails,
  }: {
    amendmentId: string;
    facilityId: string;
    dealId: string;
    auditDetails: PortalAuditDetails;
  }): Promise<FacilityAmendmentWithUkefId> {
    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
    };

    // TODO: DTFS2-7793 - check that there is not an existing amendment on the deal.

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    return await this.updatePortalFacilityAmendment({ amendmentId: amendmentMongoId, facilityId: facilityMongoId, update: amendmentUpdate, auditDetails });
  }
}

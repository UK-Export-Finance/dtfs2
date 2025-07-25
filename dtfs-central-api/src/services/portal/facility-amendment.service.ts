import { getUnixTime } from 'date-fns';
import {
  AMENDMENT_TYPES,
  FacilityAmendmentWithUkefId,
  getUnixTimestampSeconds,
  InvalidAuditDetailsError,
  PortalFacilityAmendmentConflictError,
  PortalAuditDetails,
  PortalFacilityAmendment,
  PortalFacilityAmendmentUserValues,
  PORTAL_AMENDMENT_STATUS,
  PortalAmendmentStatus,
  AmendmentNotFoundError,
  AmendmentIncompleteError,
  PORTAL_AMENDMENT_INPROGRESS_STATUSES,
  TfmActivity,
  ACTIVITY_TYPES,
  now,
} from '@ukef/dtfs2-common';
import { ObjectId } from 'mongodb';
import { cloneDeep } from 'lodash';
import { findOneUser } from '../../v1/controllers/user/get-user.controller';
import { TfmActivitiesRepo } from '../../repositories/tfm-deals-repo';
import { TfmFacilitiesRepo } from '../../repositories/tfm-facilities-repo';
import { EligibilityCriteriaAmendmentsRepo } from '../../repositories/portal/eligibility-criteria-amendments.repo';
import { findOneFacility } from '../../v1/controllers/portal/facility/get-facility.controller';

export class PortalFacilityAmendmentService {
  /**
   * Checks if there is any portal amendment in progress on a deal, throws an error if there is.
   *
   * @param params
   * @param params.facilityId - The facility id
   * @returns {Promise<void>} A promise that resolves when the find operation is complete.
   */
  public static async validateNoOtherAmendmentInProgressOnFacility({ facilityId, amendmentId }: { facilityId: string; amendmentId?: string }): Promise<void> {
    const existingPortalAmendmentInProgress = await TfmFacilitiesRepo.findPortalAmendmentsByFacilityIdAndStatus({
      facilityId,
      statuses: PORTAL_AMENDMENT_INPROGRESS_STATUSES,
    });

    const hasExistingAmendment = existingPortalAmendmentInProgress.some((amendment) => amendment.amendmentId.toString() !== amendmentId);

    if (hasExistingAmendment) {
      console.error('There is a portal facility amendment already in progress on this facility %s', facilityId);
      throw new PortalFacilityAmendmentConflictError(facilityId);
    }
  }

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

    await this.validateNoOtherAmendmentInProgressOnFacility({ facilityId });

    const { type: facilityType } = await findOneFacility(facilityId);

    const { version, criteria } = await EligibilityCriteriaAmendmentsRepo.findLatestEligibilityCriteria(facilityType);

    const updatedCriteria = criteria.map((criterion) => ({ ...criterion, answer: null }));

    const amendmentToInsert: PortalFacilityAmendment = {
      ...this.generatePortalFacilityAmendment(amendment),
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
   * Updates a portal facility amendment
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
    activity,
    allowedStatuses,
  }: {
    amendmentId: ObjectId;
    facilityId: ObjectId;
    update: Partial<PortalFacilityAmendment>;
    auditDetails: PortalAuditDetails;
    activity?: TfmActivity;
    allowedStatuses: PortalAmendmentStatus[];
  }): Promise<FacilityAmendmentWithUkefId> {
    await TfmFacilitiesRepo.updatePortalFacilityAmendmentByAmendmentId({
      amendmentId,
      facilityId,
      update,
      auditDetails,
      allowedStatuses,
    });

    const updatedAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (updatedAmendment?.type !== AMENDMENT_TYPES.PORTAL) {
      throw new Error(`Could not find amendment to return`);
    }

    if (activity) {
      const { dealId } = updatedAmendment;

      const { deal } = await TfmActivitiesRepo.submitTfmActivity({
        dealId,
        activity,
        auditDetails,
      });

      if (!deal) {
        throw new Error(`Could not add activity to deal`);
      }
    }

    return updatedAmendment;
  }

  /**
   * Updates a portal facility amendment with user provided values.
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
    const amendmentUpdate = {
      ...this.generatePortalFacilityAmendment(update),
      updatedAt: getUnixTimestampSeconds(new Date()),
    };

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    return await this.updatePortalFacilityAmendment({
      amendmentId: amendmentMongoId,
      facilityId: facilityMongoId,
      update: amendmentUpdate,
      auditDetails,
      allowedStatuses: [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED],
    });
  }

  /**
   * Updates portal facility amendment status to `Ready for checker's approval`.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
   * @param params.newStatus - The new status to set for the amendment.
   * @param params.referenceNumber - The reference number
   * @param params.auditDetails - The audit details for the update operation.
   * @returns {Promise<(import('@ukef/dtfs2-common').PortalFacilityAmendmentWithUkefId)>} A promise that resolves when the update operation is complete.
   */
  public static async submitPortalFacilityAmendmentToUkef({
    amendmentId,
    facilityId,
    newStatus,
    referenceNumber,
    auditDetails,
    bankId,
    bankName,
  }: {
    amendmentId: string;
    facilityId: string;
    newStatus: PortalAmendmentStatus;
    referenceNumber: string;
    auditDetails: PortalAuditDetails;
    bankId: string;
    bankName: string;
  }): Promise<FacilityAmendmentWithUkefId> {
    await this.validateAmendmentIsComplete({ amendmentId, facilityId });

    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      status: newStatus,
      referenceNumber,
    };

    const existingAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (!existingAmendment || existingAmendment.type === AMENDMENT_TYPES.TFM) {
      console.error('Amendment with facilityId %s and amendmentId %s is not a portal amendment', facilityId, amendmentId);
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    await this.validateNoOtherAmendmentInProgressOnFacility({ facilityId: existingAmendment.facilityId.toString(), amendmentId });

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    const timestamp = now().setSeconds(0, 0);

    const activity: TfmActivity = {
      type: ACTIVITY_TYPES.ACTIVITY,
      timestamp: getUnixTime(timestamp),
      author: {
        firstName: bankName,
        lastName: bankId,
        _id: '',
      },
      label: `Amendment ${referenceNumber} Approved`,
      text: '',
    };

    return await this.updatePortalFacilityAmendment({
      amendmentId: amendmentMongoId,
      facilityId: facilityMongoId,
      update: amendmentUpdate,
      auditDetails,
      activity,
      allowedStatuses: [PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL],
    });
  }

  /**
   * Updates portal facility amendment status to `Ready for checker's approval`.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
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
    auditDetails: PortalAuditDetails;
  }): Promise<FacilityAmendmentWithUkefId> {
    await this.validateAmendmentIsComplete({ amendmentId, facilityId });

    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
    };

    const existingAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (!existingAmendment || existingAmendment.type === AMENDMENT_TYPES.TFM) {
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    await this.validateNoOtherAmendmentInProgressOnFacility({ facilityId, amendmentId });

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    return await this.updatePortalFacilityAmendment({
      amendmentId: amendmentMongoId,
      facilityId: facilityMongoId,
      update: amendmentUpdate,
      auditDetails,
      allowedStatuses: [PORTAL_AMENDMENT_STATUS.DRAFT, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED],
    });
  }

  /**
   * Updates portal facility amendment status to `Further maker's input required`.
   *
   * @param params
   * @param params.amendmentId - The amendment id
   * @param params.facilityId - The facility id
   * @param params.auditDetails - The audit details for the update operation.
   * @returns {Promise<(import('@ukef/dtfs2-common').FacilityAmendmentWithUkefId)>} A promise that resolves when the update operation is complete.
   */
  public static async returnPortalFacilityAmendmentToMaker({
    amendmentId,
    facilityId,
    auditDetails,
  }: {
    amendmentId: string;
    facilityId: string;
    auditDetails: PortalAuditDetails;
  }): Promise<FacilityAmendmentWithUkefId> {
    await this.validateAmendmentIsComplete({ amendmentId, facilityId });

    const amendmentUpdate: Partial<PortalFacilityAmendment> = {
      status: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
    };

    const existingAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    const isNotPortalAmendment = !existingAmendment || existingAmendment?.type === AMENDMENT_TYPES.TFM;

    if (isNotPortalAmendment) {
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    await this.validateNoOtherAmendmentInProgressOnFacility({ facilityId, amendmentId });

    const facilityMongoId = new ObjectId(facilityId);
    const amendmentMongoId = new ObjectId(amendmentId);

    return await this.updatePortalFacilityAmendment({
      amendmentId: amendmentMongoId,
      facilityId: facilityMongoId,
      update: amendmentUpdate,
      auditDetails,
      allowedStatuses: [PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL],
    });
  }

  /**
   * Validates if the amendment for a facility is complete.
   *
   * @param params - The parameters for the validation.
   * @param params.amendmentId - The ID of the amendment to validate.
   * @param params.facilityId - The ID of the facility associated with the amendment.
   * @throws {AmendmentNotFoundError} If a portal amendment is not found
   * @throws {AmendmentIncompleteError} If the amendment is incomplete.
   */
  public static async validateAmendmentIsComplete({ amendmentId, facilityId }: { amendmentId: string; facilityId: string }) {
    const existingAmendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (existingAmendment?.type !== AMENDMENT_TYPES.PORTAL) {
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    if (!existingAmendment.changeCoverEndDate && !existingAmendment.changeFacilityValue) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'neither changeCoverEndDate nor changeFacilityValue is true');
    }

    const coverEndDateSectionEmpty =
      !existingAmendment.coverEndDate && !existingAmendment.isUsingFacilityEndDate && !existingAmendment.bankReviewDate && !existingAmendment.facilityEndDate;

    const amendmentHasBankReviewDate = existingAmendment.isUsingFacilityEndDate === false && existingAmendment.bankReviewDate;
    const amendmentHasFacilityEndDate = existingAmendment.isUsingFacilityEndDate === true && existingAmendment.facilityEndDate;
    const coverEndDateSectionFullyComplete = existingAmendment.coverEndDate && (amendmentHasBankReviewDate || amendmentHasFacilityEndDate);

    if (existingAmendment.changeCoverEndDate === false && !coverEndDateSectionEmpty) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'changeCoverEndDate is false but cover end date values are provided');
    }

    if (existingAmendment.changeCoverEndDate === true && !coverEndDateSectionFullyComplete) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'changeCoverEndDate is true but cover end date section incomplete');
    }

    if (!existingAmendment.changeFacilityValue && existingAmendment.value) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'changeFacilityValue is false but value provided');
    }

    if (existingAmendment.changeFacilityValue && !existingAmendment.value) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'changeFacilityValue is true but a value has not been provided');
    }

    if (!existingAmendment.effectiveDate) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'effectiveDate not provided');
    }

    if (!existingAmendment.eligibilityCriteria?.criteria.every(({ answer }) => answer)) {
      throw new AmendmentIncompleteError(facilityId, amendmentId, 'eligibilityCriteria answers are not all true');
    }
  }

  /**
   * Maps an amendment update to ensure values provided are consistent (e.g. if `changeCoverEndDate` is `false`, the `coverEndDate` should be `null`)
   *
   * @param update - The user values for the amendment.
   * @returns The modified update.
   */
  public static generatePortalFacilityAmendment(update: PortalFacilityAmendmentUserValues): PortalFacilityAmendmentUserValues {
    const draftUpdate = cloneDeep(update);

    if (draftUpdate.changeCoverEndDate === false) {
      draftUpdate.coverEndDate = null;
      draftUpdate.isUsingFacilityEndDate = null;
      draftUpdate.bankReviewDate = null;
      draftUpdate.facilityEndDate = null;
    }

    if (draftUpdate.coverEndDate) {
      draftUpdate.changeCoverEndDate = true;
    }

    if (draftUpdate.isUsingFacilityEndDate || draftUpdate.facilityEndDate) {
      draftUpdate.changeCoverEndDate = true;
      draftUpdate.isUsingFacilityEndDate = true;
      draftUpdate.bankReviewDate = null;
    }

    if (draftUpdate.isUsingFacilityEndDate === false || draftUpdate.bankReviewDate) {
      draftUpdate.changeCoverEndDate = true;
      draftUpdate.isUsingFacilityEndDate = false;
      draftUpdate.facilityEndDate = null;
    }

    if (draftUpdate.changeFacilityValue === false) {
      draftUpdate.value = null;
    }

    if (draftUpdate.value) {
      draftUpdate.changeFacilityValue = true;
    }

    return draftUpdate;
  }
}

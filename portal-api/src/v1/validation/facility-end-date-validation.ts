import { DealVersionError, InvalidParameterError, isFacilityEndDateEnabledOnGefVersion } from '@ukef/dtfs2-common';

type FacilityEndDateUpdate =
  | {
      isUsingFacilityEndDate?: true;
      facilityEndDate?: unknown;
    }
  | {
      isUsingFacilityEndDate?: false;
      bankReviewDate?: unknown;
    };

/**
 * @throws {DealVersionError} - if `dealVersion` is too low & `req` has property `isUsingFacilityEndDate`
 * @throws {InvalidParameterError} - if `isUsingFacilityEndDate` is defined & is not a boolean
 * @throws {InvalidParameterError} - if `facilityEndDate` is defined & `bankReviewDate` is defined
 * @throws {InvalidParameterError} - if `facilityEndDate` is defined & `isUsingFacilityEndDate` is false
 * @throws {InvalidParameterError} - if `bankReviewDate` is defined & `isUsingFacilityEndDate` is true
 */
export const validateFacilityEndDateParameters = (facilityUpdate: object, dealVersion: number): asserts facilityUpdate is FacilityEndDateUpdate => {
  // ^ delete this
  const reqContainsFacilityEndDateFields =
    'isUsingFacilityEndDate' in facilityUpdate || 'facilityEndDate' in facilityUpdate || 'bankReviewDate' in facilityUpdate;

  if (!isFacilityEndDateEnabledOnGefVersion(dealVersion) && reqContainsFacilityEndDateFields) {
    throw new DealVersionError(`Cannot add facility end date to deal version ${dealVersion}`);
  }

  if ('facilityEndDate' in facilityUpdate && 'bankReviewDate' in facilityUpdate) {
    throw new InvalidParameterError('bankReviewDate', facilityUpdate.bankReviewDate);
  }

  if ('isUsingFacilityEndDate' in facilityUpdate && facilityUpdate.isUsingFacilityEndDate === true && 'bankReviewDate' in facilityUpdate) {
    throw new InvalidParameterError('bankReviewDate', facilityUpdate.bankReviewDate);
  }

  if ('isUsingFacilityEndDate' in facilityUpdate && facilityUpdate.isUsingFacilityEndDate === false && 'facilityEndDate' in facilityUpdate) {
    throw new InvalidParameterError('facilityEndDate', facilityUpdate.facilityEndDate);
  }

  if ('isUsingFacilityEndDate' in facilityUpdate && typeof facilityUpdate.isUsingFacilityEndDate !== 'boolean') {
    throw new InvalidParameterError('isUsingFacilityEndDate', facilityUpdate.isUsingFacilityEndDate);
  }
};

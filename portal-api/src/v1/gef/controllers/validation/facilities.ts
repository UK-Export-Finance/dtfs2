import { uniq } from 'lodash';
import { isFacilityEndDateEnabledOnGefVersion, FACILITY_TYPE, FACILITY_PROVIDED_DETAILS, Facility, DEAL_STATUS, DealStatus } from '@ukef/dtfs2-common';
import { FACILITY_PAYMENT_TYPE } from '../../enums';

/**
 * @returns array of missing properties on facility
 */
const hasRequiredItems = (facility: Facility, dealVersion: number): (keyof Facility)[] => {
  const isMigratedFacility = !!facility.dataMigration;

  const required: (keyof Facility)[] = [];
  if (!facility.type) {
    required.push('type');
  }
  if (facility.hasBeenIssued === null) {
    required.push('hasBeenIssued');
  }
  if (!isMigratedFacility && facility.hasBeenIssued === true && !facility.name) {
    required.push('name');
  }
  if (facility.hasBeenIssued === true && facility.shouldCoverStartOnSubmission !== true && !facility.coverStartDate) {
    required.push('coverStartDate');
  }
  if (facility.hasBeenIssued === true && !facility.coverEndDate) {
    required.push('coverEndDate');
  }
  if (isFacilityEndDateEnabledOnGefVersion(dealVersion)) {
    if (facility.isUsingFacilityEndDate === null) {
      required.push('isUsingFacilityEndDate');
    }
    if (facility.isUsingFacilityEndDate === true && !facility.facilityEndDate) {
      required.push('facilityEndDate');
    }
    if (facility.isUsingFacilityEndDate === false && !facility.bankReviewDate) {
      required.push('bankReviewDate');
    }
  }
  if (facility.hasBeenIssued === false && !facility.monthsOfCover) {
    required.push('monthsOfCover');
  }
  // doc.details[] sometimes comes through with nulls so strip them out
  const strippedDetails = facility.details ? facility.details.filter((n) => n) : [];
  if (!strippedDetails.length) {
    required.push('details');
  }
  if (strippedDetails && strippedDetails.includes(FACILITY_PROVIDED_DETAILS.OTHER) && !facility.detailsOther) {
    required.push('detailsOther');
  }
  if (!facility.currency) {
    required.push('currency');
  }
  if (!facility.value) {
    required.push('value');
  }
  if (!facility.coverPercentage) {
    required.push('coverPercentage');
  }
  if (!facility.interestPercentage) {
    required.push('interestPercentage');
  }
  if (!facility.feeType) {
    required.push('feeType');
  }
  if (facility.feeType !== FACILITY_PAYMENT_TYPE.AT_MATURITY && !facility.feeFrequency) {
    required.push('feeFrequency');
  }
  if (!facility.dayCountBasis) {
    required.push('dayCountBasis');
  }

  return required;
};

/**
 * @returns facility deal status. 'Not started' if never updated, 'Completed' if all required items are provided & 'In progress' otherwise
 */
export const facilitiesStatus = (facility: Facility, dealVersion: number): DealStatus => {
  const requiredCount = hasRequiredItems(facility, dealVersion).length;
  if (!facility.updatedAt) {
    return DEAL_STATUS.NOT_STARTED;
  }
  if (requiredCount > 0) {
    return DEAL_STATUS.IN_PROGRESS;
  }

  return DEAL_STATUS.COMPLETED;
};

type FacilityInfo = {
  status: DealStatus;
  details: Facility;
  validation: { required: (keyof Facility)[] };
};

/**
 * @returns the overall status of the facilities: 'In progress' if any are in progress, 'Completed' if all are completed & 'Not started' if none are started
 */
export const facilitiesOverallStatus = (facilities: FacilityInfo[]): DealStatus => {
  const allStatus: DealStatus[] = [];
  facilities.forEach((facility) => {
    allStatus.push(facility.status);
  });
  const uniqueStatus = uniq(allStatus);

  if (uniqueStatus.length === 0) {
    return DEAL_STATUS.NOT_STARTED;
  }

  if (uniqueStatus.length === 1) {
    return uniqueStatus[0];
  }

  return DEAL_STATUS.IN_PROGRESS;
};

export const facilitiesCheckEnums = (facility: Facility) => {
  const enumErrors = [];
  switch (facility.type) {
    case FACILITY_TYPE.CASH:
    case FACILITY_TYPE.CONTINGENT:
    case null:
    case undefined:
      break;
    default:
      enumErrors.push({ status: 422, errCode: 'ENUM_ERROR', errMsg: 'Unrecognised enum', errRef: 'type' });
      break;
  }

  return enumErrors.length === 0 ? null : enumErrors;
};

export const facilitiesValidation = (facility: Facility, dealVersion: number) => ({
  required: hasRequiredItems(facility, dealVersion),
});

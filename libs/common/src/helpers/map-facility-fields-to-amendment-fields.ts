import { FacilityAmendment } from '../types';
import { isFutureEffectiveDate } from './amendment-future-effectiveDate';

type UpdatedFields = {
  coverEndDate?: number | null;
  value?: number | null;
  facilityEndDate?: Date | null;
  bankReviewDate?: Date | null;
};

/**
 * Finds the first amendment in the amendments array for coverEndDate, value, facilityEndDate and bankReviewDate and check if the `effectiveDate` is not in the future.
 * if the updatedValue for either fields is not already set, then it will be set to the amended value from the amendment
 * @param amendments - amendments array
 * @returns object with amended coverEndDate, value, facilityEndDate and bankReviewDate
 */
export const mapFacilityFieldsToAmendmentFields = (amendments: FacilityAmendment[]) => {
  const updatedFields: UpdatedFields = {};

  for (const amendment of amendments) {
    const hasFutureEffectiveDate = amendment.effectiveDate && isFutureEffectiveDate(amendment.effectiveDate);

    if (!hasFutureEffectiveDate) {
      const updateCoverEndDate = !updatedFields.coverEndDate && amendment.coverEndDate;
      const updateValue = !updatedFields.value && amendment.value;
      const updateFacilityEndDate = !updatedFields.facilityEndDate && amendment.facilityEndDate;
      const updateBankReviewDate = !updatedFields.bankReviewDate && amendment.bankReviewDate;

      if (updateCoverEndDate) {
        updatedFields.coverEndDate = amendment.coverEndDate;
      }

      if (updateValue) {
        updatedFields.value = amendment.value;
      }

      if (updateFacilityEndDate) {
        updatedFields.facilityEndDate = amendment.facilityEndDate;
      }

      if (updateBankReviewDate) {
        updatedFields.bankReviewDate = amendment.bankReviewDate;
      }
    }
  }

  return updatedFields;
};

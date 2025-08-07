import { FacilityAmendment } from '../types';
import { isFutureEffectiveDate } from './amendment-future-effectiveDate';

type UpdatedFields = {
  coverEndDate?: number | null;
  value?: number | null;
};

/**
 * Finds the first amendment in the amendments array for coverEndDate and value and check if the `effectiveDate` is not in the future.
 * if the updatedValue for either field is not already set, then it will be set to the amended value from the amendment
 * @param amendments - amendments array
 * @returns object with amended coverEndDate and value
 */
export const mapFacilityFieldsToAmendmentFields = (amendments: FacilityAmendment[]) => {
  const updatedFields: UpdatedFields = {};

  for (const amendment of amendments) {
    const hasFutureEffectiveDate = amendment.effectiveDate && isFutureEffectiveDate(amendment.effectiveDate);

    if (!hasFutureEffectiveDate) {
      if (!updatedFields.coverEndDate && amendment.coverEndDate) {
        updatedFields.coverEndDate = amendment.coverEndDate;
      }

      if (!updatedFields.value && amendment.value) {
        updatedFields.value = amendment.value;
      }

      // If both fields are set, break the loop
      if (updatedFields.coverEndDate && updatedFields.value) {
        break;
      }
    }
  }

  return updatedFields;
};

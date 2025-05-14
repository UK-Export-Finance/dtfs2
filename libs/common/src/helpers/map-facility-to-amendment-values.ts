import { FacilityAmendment } from '../types';

/**
 * Finds the first amendment in the amendments array for coverEndDate and value
 * if the updatedValue for either field is not already set, then it will be set to the amended value from the amendment
 * @param amendments - amendments array
 * @returns object with amended coverEndDate and value
 */
export const mapAmendmentToFacilityValues = (amendments: FacilityAmendment[]) => {
  return amendments.reduce((updatedFields, amendment) => {
    const amendedValues = updatedFields;

    /**
     * if updatedFields does not have a coverEndDate or value,
     * then set it to the amended value from the amendment
     * hence ensuring that the latest amendment for each field is used
     */
    if (!updatedFields.coverEndDate && amendment.coverEndDate) {
      amendedValues.coverEndDate = amendment.coverEndDate;
    }
    if (!updatedFields.value && amendment.value) {
      amendedValues.value = amendment.value;
    }

    return amendedValues;
  });
};

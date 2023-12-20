/**
 * Checks if the `dealIdentifier` and `facilityIdentifiers` are present in the `eStoreData` object
 * and if they do not contain certain temporary IDs and conforms to the pre-defined ID format.
 * @param eStoreData - An object containing the `dealIdentifier` and `facilityIdentifiers` properties.
 * @returns `true` if the `dealIdentifier` and `facilityIdentifiers` are present and do not contain temporary IDs, `false` otherwise.
 */
import { UKEF_ID } from '../constants';
import { validUkefId } from './validUkefId';

export const isValidId = (eStoreData: any): boolean => {
  const voidIds = [UKEF_ID.TEST, UKEF_ID.PENDING];
  const { dealIdentifier, facilityIdentifiers } = eStoreData;

  // Falsy check
  if (!dealIdentifier || !facilityIdentifiers) {
    return false;
  }

  // Void ID check
  if (voidIds.includes(dealIdentifier) || voidIds.some((id: string) => facilityIdentifiers.includes(id))) {
    return false;
  }

  // Format check
  if (!validUkefId(dealIdentifier) && !facilityIdentifiers.every((id: string) => validUkefId(id))) {
    return false;
  }

  return true;
};

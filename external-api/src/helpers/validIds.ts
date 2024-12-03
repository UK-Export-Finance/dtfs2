/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Checks if the `dealIdentifier` and `facilityIdentifiers` are present in the `eStoreData` object
 * and if they do not contain certain temporary IDs and conforms to the pre-defined ID format.
 * @param eStoreData - An object containing the `dealIdentifier` and `facilityIdentifiers` properties.
 * @returns `true` if the `dealIdentifier` and `facilityIdentifiers` are present and do not contain temporary IDs, `false` otherwise.
 */
import { Estore } from '../interfaces/eStore.interface';
import { UKEF_ID } from '../constants';
import { validUkefId } from './validUkefId';

export const areValidUkefIds = (eStoreData: Estore): boolean => {
  const invalidIds = [UKEF_ID.TEST, Number(UKEF_ID.TEST), UKEF_ID.PENDING];
  const { dealIdentifier, facilityIdentifiers } = eStoreData;

  // Falsy check
  if (!dealIdentifier || !facilityIdentifiers) {
    return false;
  }

  // Void ID check
  if (invalidIds.includes(dealIdentifier) || invalidIds.some((id: any) => facilityIdentifiers.includes(id))) {
    return false;
  }

  // Format check
  if (!validUkefId(dealIdentifier) || !facilityIdentifiers.every((id: number) => validUkefId(String(id)))) {
    return false;
  }

  return true;
};

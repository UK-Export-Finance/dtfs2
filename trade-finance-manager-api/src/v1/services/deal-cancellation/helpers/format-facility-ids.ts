/**
 * Formats the facility IDs for sending a numbered list in an email
 *
 * @param facilityIds an array of the facility UKEF IDs
 * @returns a formatted numbered list of the facility IDs
 *
 * @example
 * ```
 * formatFacilityIds(['UkefId1', 'UkefId2'])
 * /* Returns
 * * ` 1. Facility ID UkefId1
 * *  2. Facility Id UkefId2`
 * /
 * ```
 */
export const formatFacilityIds = (facilityIds: string[]) => facilityIds.map((id, index) => ` ${index + 1}. Facility ID ${id}`).join(`\n`);

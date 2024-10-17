export const formatFacilityIds = (facilityIds: string[]) => facilityIds.map((id, index) => ` ${index + 1}. Facility ID ${id}`).join(`\n`);

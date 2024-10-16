export const formatFacilityIds = (facilityIds: string[]) =>
  facilityIds.reduce((previousValue, currentValue, index) => `${previousValue}${index ? '\n' : ''} ${index + 1}. Facility ID ${currentValue}`, '');

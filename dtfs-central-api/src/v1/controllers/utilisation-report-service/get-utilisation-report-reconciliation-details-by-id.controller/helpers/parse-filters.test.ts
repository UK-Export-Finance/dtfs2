import { parsePremiumPaymentsTabFilters } from './parse-filters';

describe('parsePremiumPaymentsTabFilters', () => {
  it('returns an empty object when premiumPaymentsTabFilters is undefined', () => {
    // Arrange
    const premiumPaymentsTabFilters = undefined;
    const expectedParsedFilters = {};

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsTabFilters(premiumPaymentsTabFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expectedParsedFilters);
  });

  it('returns an object with undefined facilityId when an invalid facilityId is provided', () => {
    // Arrange
    const premiumPaymentsTabFilters = { facilityId: 'invalid-facility-id' };
    const expectedParsedFilters = { facilityId: undefined };

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsTabFilters(premiumPaymentsTabFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expectedParsedFilters);
  });

  it('returns an object with valid facilityId when a valid facilityId is provided', () => {
    // Arrange
    const validFacilityId = '123456789';
    const premiumPaymentsTabFilters = { facilityId: validFacilityId };
    const expectedParsedFilters = { facilityId: validFacilityId };

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsTabFilters(premiumPaymentsTabFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expectedParsedFilters);
  });
});

import { parsePremiumPaymentsFilters } from './parse-filters';

describe('parsePremiumPaymentsFilters', () => {
  it('returns an empty object when premiumPaymentsFilters is undefined', () => {
    // Arrange
    const expected = {};

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters();

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expected);
  });

  it('returns an object with undefined facilityId when an invalid facilityId is provided', () => {
    // Arrange
    const premiumPaymentsFilters = { facilityId: 'invalid-facility-id' };
    const expected = { facilityId: undefined };

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expected);
  });

  it('returns an object with valid facilityId when a valid facilityId is provided', () => {
    // Arrange
    const validFacilityId = '123456789';
    const premiumPaymentsFilters = { facilityId: validFacilityId };
    const expected = premiumPaymentsFilters;

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsFilters(premiumPaymentsFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toEqual(expected);
  });
});

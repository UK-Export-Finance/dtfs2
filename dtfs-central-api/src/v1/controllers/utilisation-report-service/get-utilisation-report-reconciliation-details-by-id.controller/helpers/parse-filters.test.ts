import { parsePremiumPaymentsTabFilters } from './parse-filters';

describe('parsePremiumPaymentsTabFilters', () => {
  it('returns an empty object when premiumPaymentsTabFilters is undefined', () => {
    // Arrange
    const premiumPaymentsTabFilters = undefined;
    const expectedParsedFilters = {};

    // Act
    const premiumPaymentsTabParsedFilters = parsePremiumPaymentsTabFilters(premiumPaymentsTabFilters);

    // Assert
    expect(premiumPaymentsTabParsedFilters).toBe(expectedParsedFilters);
  });

  // TODO FN-2311: Add additional test: If invalid facilityId value.
  // TODO FN-2311: Add additional test: If valid facilityId value.
});

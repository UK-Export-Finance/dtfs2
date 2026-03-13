import { mapObligations } from '.';

describe('mapObligations', () => {
  it('should return an array with one repayment profile', () => {
    // Arrange
    const currency = 'GBP';
    const effectiveDate = '2024-01-28';
    const maturityDate = '2026-02-14';
    const subtypeName = 'Mock sub type name';
    const ukefExposure = 1500;

    // Act
    const result = mapObligations({ currency, effectiveDate, maturityDate, subtypeName, ukefExposure });

    // Assert
    const expected = [
      {
        amount: ukefExposure,
        currency,
        effectiveDate,
        maturityDate,
        subtypeCode: `TODO - ${subtypeName}`,
      },
    ];

    expect(result).toEqual(expected);
  });
});

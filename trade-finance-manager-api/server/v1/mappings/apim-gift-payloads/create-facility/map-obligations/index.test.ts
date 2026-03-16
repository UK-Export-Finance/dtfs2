import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligations } from '.';

const { OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  it('should return an array with one repayment profile', () => {
    // Arrange
    const currency = 'GBP';
    const effectiveDate = '2024-01-28';
    const maturityDate = '2026-02-14';
    const subtypeName = 'Performance bond';
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
        subtypeCode: OBLIGATION_SUBTYPE_MAP.BSS['Performance bond'],
      },
    ];

    expect(result).toEqual(expected);
  });
});

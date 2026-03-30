import { FACILITY_TYPE } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../constants';
import { mapObligationAmount } from './map-obligation-amount';
import { mapObligations } from '.';

const { DEFAULTS, OBLIGATION_SUBTYPE_MAP } = APIM_GIFT_INTEGRATION;

describe('mapObligations', () => {
  it('should return an array with one obligation', () => {
    // Arrange
    const currency = 'GBP';
    const effectiveDate = '2024-01-28';
    const facilityType = FACILITY_TYPE.CASH;
    const isGefDeal = true;
    const maturityDate = '2026-02-14';
    const subtypeName = 'Performance bond';
    const ukefExposure = 1500;

    // Act
    const result = mapObligations({
      currency,
      effectiveDate,
      facilityType,
      isGefDeal,
      maturityDate,
      subtypeName,
      ukefExposure,
    });

    // Assert
    const expected = [
      {
        amount: mapObligationAmount({ isGefDeal, facilityType, ukefExposure }),
        currency,
        effectiveDate,
        maturityDate,
        repaymentType: DEFAULTS.REPAYMENT_TYPE.BULLET,
        subtypeCode: OBLIGATION_SUBTYPE_MAP.BSS['Performance bond'],
      },
    ];

    expect(result).toEqual(expected);
  });
});

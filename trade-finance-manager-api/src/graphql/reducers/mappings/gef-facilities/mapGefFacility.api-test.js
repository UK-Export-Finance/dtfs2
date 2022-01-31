const mapGefFacility = require('./mapGefFacility');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapGefFacilityProvidedOn = require('./mapGefFacilityProvidedOn');
const mapFacilityTfm = require('../facilities/mapFacilityTfm');

const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacility', () => {
  it('should return mapped GEF facility', () => {
    const mockFacility = {
      _id: MOCK_CASH_CONTINGENT_FACILIIES[0]._id,
      facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
      tfm: {},
    };

    const mockDealTfm = {};

    const result = mapGefFacility(
      mockFacility,
      MOCK_GEF_DEAL,
      mockDealTfm,
    );

    const formattedFacilityValue = formattedNumber(mockFacility.facilitySnapshot.value);

    mockFacility.facilitySnapshot.facilityProduct = mapFacilityProduct(mockFacility.facilitySnapshot.type);

    mockFacility.facilitySnapshot.facilityStage = mapFacilityStage(mockFacility.facilitySnapshot.hasBeenIssued);

    const { facilitySnapshot } = mockFacility;

    const expected = {
      _id: mockFacility._id,
      facilitySnapshot: {
        _id: mockFacility._id,
        dealId: facilitySnapshot.dealId,
        bankFacilityReference: facilitySnapshot.name,
        banksInterestMargin: `${facilitySnapshot.interestPercentage}%`,
        coveredPercentage: `${facilitySnapshot.coverPercentage}%`,
        dates: mapGefFacilityDates(facilitySnapshot, mockFacility.tfm, MOCK_GEF_DEAL),
        facilityProduct: mapFacilityProduct(facilitySnapshot.type),
        facilityStage: mapFacilityStage(facilitySnapshot.hasBeenIssued),
        hasBeenIssued: facilitySnapshot.hasBeenIssued,
        type: mapFacilityType(facilitySnapshot),
        currency: facilitySnapshot.currency.id,
        facilityValueExportCurrency: `${facilitySnapshot.currency.id} ${formattedFacilityValue}`,
        value: mapFacilityValue(facilitySnapshot.currency.id, formattedFacilityValue, mockFacility.tfm),
        feeType: mapGefFacilityFeeType(facilitySnapshot.paymentType),
        feeFrequency: facilitySnapshot.feeFrequency,
        guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFee),
        dayCountBasis: facilitySnapshot.dayCountBasis,
        ukefFacilityType: mapGefUkefFacilityType(facilitySnapshot.type),
        ukefFacilityId: facilitySnapshot.ukefFacilityId,
        ukefExposure: `${facilitySnapshot.currency.id} ${facilitySnapshot.ukefExposure}`,
        providedOn: mapGefFacilityProvidedOn(facilitySnapshot.details),
        providedOnOther: facilitySnapshot.detailsOther,
      },
      tfm: mapFacilityTfm(mockFacility.tfm, mockDealTfm),
    };

    expect(result).toEqual(expected);
  });
});

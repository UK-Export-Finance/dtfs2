const mapGefFacility = require('./mapGefFacility');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapUkefExposureValue = require('../facilities/mapUkefExposureValue');
const mapFacilityTfm = require('../facilities/mapFacilityTfm');

const MOCK_GEF_DEAL = require('../../../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../../../__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacility', () => {
  it('should return mapped GEF facility', () => {
    const mockFacility = {
      _id: MOCK_CASH_CONTINGENT_FACILITIES[0]._id,
      facilitySnapshot: MOCK_CASH_CONTINGENT_FACILITIES[0],
      tfm: {},
    };

    const mockDealTfm = {};

    const result = mapGefFacility(mockFacility, MOCK_GEF_DEAL, mockDealTfm);

    const formattedFacilityValue = formattedNumber(mockFacility.facilitySnapshot.value);

    mockFacility.facilitySnapshot.facilityProduct = mapFacilityProduct(mockFacility.facilitySnapshot.type);

    mockFacility.facilitySnapshot.facilityStage = mapFacilityStage(mockFacility.facilitySnapshot.hasBeenIssued);

    const { facilitySnapshot } = mockFacility;

    const expected = {
      _id: mockFacility._id,
      facilitySnapshot: {
        _id: mockFacility._id,
        isGef: true,
        dealId: facilitySnapshot.dealId,
        bankFacilityReference: facilitySnapshot.name,
        banksInterestMargin: `${facilitySnapshot.interestPercentage}%`,
        coveredPercentage: `${facilitySnapshot.coverPercentage}%`,
        dates: mapGefFacilityDates(mockFacility, mockFacility.tfm, MOCK_GEF_DEAL),
        facilityProduct: mapFacilityProduct(facilitySnapshot.type),
        facilityStage: mapFacilityStage(facilitySnapshot.hasBeenIssued),
        hasBeenIssued: facilitySnapshot.hasBeenIssued,
        type: mapFacilityType(facilitySnapshot),
        currency: facilitySnapshot.currency.id,
        facilityValueExportCurrency: `${facilitySnapshot.currency.id} ${formattedFacilityValue}`,
        value: mapFacilityValue(facilitySnapshot.currency.id, formattedFacilityValue, mockFacility),
        feeType: facilitySnapshot.feeType,
        feeFrequency: facilitySnapshot.feeFrequency,
        guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(facilitySnapshot.guaranteeFee),
        dayCountBasis: facilitySnapshot.dayCountBasis,
        ukefFacilityType: mapGefUkefFacilityType(facilitySnapshot.type),
        ukefFacilityId: facilitySnapshot.ukefFacilityId,
        ukefExposure: mapUkefExposureValue(mockFacility.tfm, mockFacility),
        providedOn: facilitySnapshot.details,
        providedOnOther: facilitySnapshot.detailsOther,
      },
      tfm: mapFacilityTfm(mockFacility.tfm, mockDealTfm, mockFacility),
    };

    expect(result).toEqual(expected);
  });
});

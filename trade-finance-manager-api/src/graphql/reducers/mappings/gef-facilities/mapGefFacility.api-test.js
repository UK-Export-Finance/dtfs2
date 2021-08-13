const mapGefFacility = require('./mapGefFacility');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityStage = require('../facilities/mapFacilityStage');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGefFacilityFeeType = require('./mapGefFacilityFeeType');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');

const MOCK_GEF_DEAL = require('../../../../v1/__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILIIES = require('../../../../v1/__mocks__/mock-cash-contingent-facilities');

describe('mapGefFacility', () => {
  it('should return mapped GEF facility', () => {
    const mockFacility = {
      _id: MOCK_CASH_CONTINGENT_FACILIIES[0]._id,
      facilitySnapshot: MOCK_CASH_CONTINGENT_FACILIIES[0],
      tfm: {},
    };

    const result = mapGefFacility(
      mockFacility,
      MOCK_GEF_DEAL,
    );

    const formattedFacilityValue = formattedNumber(mockFacility.facilitySnapshot.value);

    mockFacility.facilitySnapshot.facilityProduct = mapFacilityProduct(mockFacility.facilitySnapshot.type);

    mockFacility.facilitySnapshot.facilityStage = mapFacilityStage(mockFacility.facilitySnapshot.hasBeenIssued);


    const { facilitySnapshot } = mockFacility;

    const expected = {
      _id: mockFacility._id, // eslint-disable-line no-underscore-dangle
      facilitySnapshot: {
        _id: mockFacility._id, // eslint-disable-line no-underscore-dangle
        associatedDealId: facilitySnapshot.associatedDealId,
        bankFacilityReference: facilitySnapshot.name,
        banksInterestMargin: `${facilitySnapshot.interestPercentage}%`,
        coveredPercentage: `${facilitySnapshot.coverPercentage}%`,
        dates: mapGefFacilityDates(facilitySnapshot, mockFacility.tfm, MOCK_GEF_DEAL),
        facilityProduct: mapFacilityProduct(facilitySnapshot.type),
        facilityStage: mapFacilityStage(facilitySnapshot.hasBeenIssued),
        facilityType: mapFacilityType(facilitySnapshot),
        facilityValueExportCurrency: `${facilitySnapshot.currency} ${formattedFacilityValue}`,
        facilityValue: mapFacilityValue(facilitySnapshot.currency, formattedFacilityValue, mockFacility.tfm),
        feeType: mapGefFacilityFeeType(facilitySnapshot.paymentType),
        ukefFacilityType: mapGefUkefFacilityType(facilitySnapshot.type),
        ukefFacilityID: 'UKEF-ID-TODO',
        ukefGuaranteeInMonths: facilitySnapshot.monthsOfCover,
      },
      tfm: mockFacility.tfm,
    };

    expect(result).toEqual(expected);
  });
});

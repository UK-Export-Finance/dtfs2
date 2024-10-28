const mapGefFacilitySnapshot = require('./mapGefFacilitySnapshot');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityValue = require('../facilities/mapFacilityValue');
const mapFacilityProduct = require('../facilities/mapFacilityProduct');
const mapFacilityType = require('../facilities/mapFacilityType');
const mapGuaranteeFeePayableToUkef = require('../facilities/mapGuaranteeFeePayableToUkef');
const mapGefUkefFacilityType = require('./mapGefUkefFacilityType');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapUkefExposureValue = require('../facilities/mapUkefExposureValue');

const MOCK_GEF_DEAL = require('../../../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../../../__mocks__/mock-cash-contingent-facilities');
const { mapGefFacilityStage } = require('../facilities/mapFacilityStage');

describe('mapGefFacilitySnapshot', () => {
  it('should return mapped GEF facility snapshot', () => {
    const mockFacility = {
      _id: MOCK_CASH_CONTINGENT_FACILITIES[0]._id,
      facilitySnapshot: MOCK_CASH_CONTINGENT_FACILITIES[0],
      tfm: {},
    };

    const result = mapGefFacilitySnapshot(mockFacility, MOCK_GEF_DEAL);

    const formattedFacilityValue = formattedNumber(mockFacility.facilitySnapshot.value);

    mockFacility.facilitySnapshot.facilityProduct = mapFacilityProduct(mockFacility.facilitySnapshot.type);

    mockFacility.facilitySnapshot.facilityStage = mapGefFacilityStage(mockFacility.facilitySnapshot.hasBeenIssued, mockFacility.tfm.facilityStage);

    const { facilitySnapshot } = mockFacility;

    const expected = {
      _id: mockFacility._id,
      isGef: true,
      dealId: facilitySnapshot.dealId,
      bankFacilityReference: facilitySnapshot.name,
      banksInterestMargin: `${facilitySnapshot.interestPercentage}%`,
      coveredPercentage: `${facilitySnapshot.coverPercentage}%`,
      dates: mapGefFacilityDates(mockFacility, mockFacility.tfm, MOCK_GEF_DEAL),
      facilityProduct: mapFacilityProduct(facilitySnapshot.type),
      facilityStage: mapGefFacilityStage(facilitySnapshot.hasBeenIssued, mockFacility.tfm.facilityStage),
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
    };

    expect(result).toEqual(expected);
  });
});

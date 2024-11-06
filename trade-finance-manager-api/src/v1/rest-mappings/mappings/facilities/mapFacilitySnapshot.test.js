const { BOND_TYPE } = require('@ukef/dtfs2-common');
const mapFacilitySnapshot = require('./mapFacilitySnapshot');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapBanksInterestMargin = require('./mapBanksInterestMargin');
const mapFirstDrawdownAmountInExportCurrency = require('./mapFirstDrawdownAmountInExportCurrency');
const mapFeeType = require('./mapFeeType');
const mapFeeFrequency = require('./mapFeeFrequency');
const mapDates = require('./mapDates');

const MOCK_DEAL = require('../../../__mocks__/mock-deal');
const { mapBssEwcsFacilityStage } = require('./mapFacilityStage');
const { mapBssEwcsFacilityType } = require('./mapFacilityType');

describe('mapFacility', () => {
  const mockFacilityTfm = {
    ukefExposure: '1,234.00',
    ukefExposureCalculationTimestamp: '1606900616651',
    facilityValueInGBP: '12345',
  };

  const mockDealDetails = MOCK_DEAL.details;

  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '02',
    'coverEndDate-year': '2021',
  };

  const mockCoveredPercentage = '10';

  const mockCurrency = {
    text: 'GBP - UK Sterling',
    id: 'GBP',
  };

  const mockFacilityValue = '12345.00';
  const mockType = 'Bond';
  const mockFacilityStage = 'Unissued';

  const mockFacilitySnapshot = {
    _id: '12345678',
    dealId: '100200300',
    ukefFacilityId: '0040004833',
    type: mockType,
    ukefFacilityType: mockType,
    ...mockCoverEndDate,
    coveredPercentage: mockCoveredPercentage,
    bondType: BOND_TYPE.PERFORMANCE_BOND,
    currency: mockCurrency,
    value: mockFacilityValue,
    facilityStage: mockFacilityStage,
    hasBeenIssued: false,
    name: '123456',
    bondIssuer: 'Issuer',
    bondBeneficiary: 'test',
    ukefExposure: '1,234.00',
    riskMarginFee: '10',
    ukefGuaranteeInMonths: '10',

    // fields we do not consume
    guaranteeFeePayableByBank: '9.0000',
    currencySameAsSupplyContractCurrency: 'true',
    minimumRiskMarginFee: '30',
    feeType: 'At maturity',
    dayCountBasis: '365',
  };

  const mockFacility = {
    facilitySnapshot: {
      ...mockFacilitySnapshot,
    },
    tfm: {
      ...mockFacilityTfm,
    },
  };

  it('should map and format correct fields/values', () => {
    const result = mapFacilitySnapshot(mockFacility, MOCK_DEAL);

    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const formattedFacilityValue = formattedNumber(mockFacilityValue);

    const expectedFacilityValueExportCurrency = `${mockCurrency.id} ${formattedFacilityValue}`;

    const expectedFacilityProduct = mapFacilityProduct(mockFacilitySnapshot.type);

    const expectedType = mapBssEwcsFacilityType(mockType, mockFacilitySnapshot);

    const expectedBanksInterestMargin = mapBanksInterestMargin({
      ...mockFacilitySnapshot,
      facilityProduct: expectedFacilityProduct,
    });

    const facilityLatest = {
      facilitySnapshot: {
        ...mockFacilitySnapshot,
        facilityProduct: expectedFacilityProduct,
      },
    };

    const expectedFirstDrawdownAmountInExportCurrency = mapFirstDrawdownAmountInExportCurrency(facilityLatest.facilitySnapshot);

    const expectedDates = mapDates(facilityLatest, facilityLatest.facilitySnapshot, mockFacilityTfm, mockDealDetails);

    const expected = {
      _id: mockFacilitySnapshot._id,
      isGef: false,
      dealId: mockFacilitySnapshot.dealId,
      ukefFacilityId: mockFacilitySnapshot.ukefFacilityId,
      type: expectedType,
      ukefFacilityType: mockType,
      facilityProduct: expectedFacilityProduct,
      facilityStage: mapBssEwcsFacilityStage(mockFacilityStage),
      hasBeenIssued: mockFacilitySnapshot.hasBeenIssued,
      coveredPercentage: expectedCoveredPercentage,
      value: mapFacilityValue(mockFacilitySnapshot.currency.id, formattedFacilityValue, mockFacility),
      currency: mockFacilitySnapshot.currency.id,
      facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      ukefExposure: `${mockFacilitySnapshot.currency.id} ${mockFacilitySnapshot.ukefExposure}`,
      bankFacilityReference: mapBankFacilityReference(mockFacilitySnapshot),
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(mockFacilitySnapshot.guaranteeFeePayableByBank, 4),
      banksInterestMargin: expectedBanksInterestMargin,
      firstDrawdownAmountInExportCurrency: expectedFirstDrawdownAmountInExportCurrency,
      feeType: mapFeeType(facilityLatest.facilitySnapshot),
      feeFrequency: mapFeeFrequency(facilityLatest.facilitySnapshot),
      dayCountBasis: Number(mockFacilitySnapshot.dayCountBasis),
      dates: expectedDates,
      bondIssuer: mockFacilitySnapshot.bondIssuer,
      bondBeneficiary: mockFacilitySnapshot.bondBeneficiary,
    };

    expect(result).toEqual(expected);
  });
});

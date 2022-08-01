const mapFacility = require('./mapFacility');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
const mapFacilityStage = require('./mapFacilityStage');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapBanksInterestMargin = require('./mapBanksInterestMargin');
const mapFirstDrawdownAmountInExportCurrency = require('./mapFirstDrawdownAmountInExportCurrency');
const mapFeeType = require('./mapFeeType');
const mapFeeFrequency = require('./mapFeeFrequency');
const mapDates = require('./mapDates');
const api = require('../../../../v1/api');

const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal');

describe('mapFacility', () => {
  const mockTfmFacility = {
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

  const mockFacility = {
    _id: '12345678',
    dealId: '100200300',
    ukefFacilityId: '0040004833',
    type: mockType,
    ukefFacilityType: mockType,
    ...mockCoverEndDate,
    coveredPercentage: mockCoveredPercentage,
    bondType: 'Performance Bond',
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

  const mockFacilityFull = {
    facilitySnapshot: {
      ...mockFacility,
    },
    tfm: {
      ...mockTfmFacility,
    },
  };

  it('should map and format correct fields/values', async () => {
    api.getLatestCompletedAmendment = () => Promise.resolve({});

    const result = await mapFacility(mockFacility, mockTfmFacility, mockDealDetails, mockFacilityFull);

    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const formattedFacilityValue = formattedNumber(mockFacilityValue);

    const expectedFacilityValueExportCurrency = `${mockCurrency.id} ${formattedFacilityValue}`;

    const facilityStage = mapFacilityStage(mockFacilityStage);

    const expectedFacilityProduct = mapFacilityProduct(mockFacility.type);

    const expectedType = mapFacilityType({
      ...mockFacility,
      facilityProduct: expectedFacilityProduct,
    });

    const expectedBanksInterestMargin = mapBanksInterestMargin({
      ...mockFacility,
      facilityProduct: expectedFacilityProduct,
    });

    const facilityLatest = {
      ...mockFacility,
      facilityStage,
      facilityProduct: expectedFacilityProduct,
    };

    const expectedFirstDrawdownAmountInExportCurrency = mapFirstDrawdownAmountInExportCurrency(facilityLatest);

    const expectedDates = await mapDates(
      facilityLatest,
      mockTfmFacility,
      mockDealDetails,
    );

    const expected = {
      _id: mockFacility._id,
      dealId: mockFacility.dealId,
      ukefFacilityId: mockFacility.ukefFacilityId,
      type: expectedType,
      ukefFacilityType: mockType,
      facilityProduct: expectedFacilityProduct,
      facilityStage: mapFacilityStage(mockFacilityStage),
      hasBeenIssued: mockFacility.hasBeenIssued,
      coveredPercentage: expectedCoveredPercentage,
      value: await mapFacilityValue(mockFacility.currency.id, formattedFacilityValue, mockFacilityFull),
      currency: mockFacility.currency.id,
      facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      ukefExposure: `${mockFacility.currency.id} ${mockFacility.ukefExposure}`,
      bankFacilityReference: mapBankFacilityReference(mockFacility),
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(mockFacility.guaranteeFeePayableByBank, 4),
      banksInterestMargin: expectedBanksInterestMargin,
      firstDrawdownAmountInExportCurrency: expectedFirstDrawdownAmountInExportCurrency,
      feeType: mapFeeType(facilityLatest),
      feeFrequency: mapFeeFrequency(facilityLatest),
      dayCountBasis: Number(mockFacility.dayCountBasis),
      dates: expectedDates,
      bondIssuer: mockFacility.bondIssuer,
      bondBeneficiary: mockFacility.bondBeneficiary,
    };

    expect(result).toEqual(expected);
  });
});

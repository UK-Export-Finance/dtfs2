const mapFacility = require('./mapFacility');
const { formattedNumber } = require('../../../../utils/number');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityType = require('./mapFacilityType');
const mapFacilityStage = require('./mapFacilityStage');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapBanksInterestMargin = require('./mapBanksInterestMargin');
const mapDates = require('./mapDates');

const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal');

describe('mapFacility', () => {
  const mockTfmFacility = {
    ukefExposure: '1,234.00',
    ukefExposureCalculationTimestamp: '1606900616651',
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
  const mockFacilityType = 'bond';
  const mockFacilityStage = 'Unissued';

  const mockFacility = {
    _id: '12345678',
    associatedDealId: '100200300',
    ukefFacilityID: '0040004833',
    facilityType: mockFacilityType,
    ...mockCoverEndDate,
    coveredPercentage: mockCoveredPercentage,
    bondType: 'Performance Bond',
    currency: mockCurrency,
    facilityValue: mockFacilityValue,
    facilityStage: mockFacilityStage,
    bankReferenceNumber: '123456',
    bondIssuer: 'Issuer',
    bondBeneficiary: 'test',
    ukefExposure: '1,234.00',
    riskMarginFee: '10',

    // fields we do not consume
    ukefGuaranteeInMonths: '10',
    guaranteeFeePayableByBank: '9.0000',
    currencySameAsSupplyContractCurrency: 'true',
    minimumRiskMarginFee: '30',
    feeType: 'At maturity',
    dayCountBasis: '365',
  };

  it('should map and format correct fields/values', async () => {
    const result = mapFacility(mockFacility, mockTfmFacility, mockDealDetails);

    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const formattedFacilityValue = formattedNumber(mockFacilityValue);

    const expectedFacilityValueExportCurrency = `${mockCurrency.id} ${formattedFacilityValue}`;

    const facilityStage = mapFacilityStage(mockFacilityStage);

    const expectedFacilityProduct = mapFacilityProduct(mockFacility);

    const expectedFacilityType = mapFacilityType({
      ...mockFacility,
      facilityProduct: expectedFacilityProduct,
    });

    const expectedBanksInterestMargin = mapBanksInterestMargin({
      ...mockFacility,
      facilityProduct: expectedFacilityProduct,
    });

    const expectedDates = mapDates({
      ...mockFacility,
      facilityStage,
    }, mockDealDetails);

    const expected = {
      _id: mockFacility._id, // eslint-disable-line no-underscore-dangle
      associatedDealId: mockFacility.associatedDealId,
      ukefFacilityID: mockFacility.ukefFacilityID,
      facilityType: expectedFacilityType,
      ukefFacilityType: mockFacilityType,
      facilityProduct: expectedFacilityProduct,
      facilityStage: mapFacilityStage(mockFacilityStage),
      coveredPercentage: expectedCoveredPercentage,
      facilityValue: mapFacilityValue(mockFacility.currency, formattedFacilityValue, mockTfmFacility),
      facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      ukefExposure: `${mockFacility.currency.id} ${mockFacility.ukefExposure}`,
      bankFacilityReference: mapBankFacilityReference(mockFacility),
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(mockFacility.guaranteeFeePayableByBank, 4),
      banksInterestMargin: expectedBanksInterestMargin,
      bondIssuer: mockFacility.bondIssuer,
      bondBeneficiary: mockFacility.bondBeneficiary,
      dates: expectedDates,
    };

    expect(result).toEqual(expected);
  });
});

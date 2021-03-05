const mapFacility = require('./mapFacility');
const { formattedNumber } = require('../../../../utils/number');
const { capitalizeFirstLetter } = require('../../../../utils/string');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityStage = require('./mapFacilityStage');
const mapFacilityValue = require('./mapFacilityValue');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapDates = require('./mapDates');
const mapUkefExposure = require('./mapUkefExposure');
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

    // fields we do not consume
    ukefExposure: '1,234.00',
    ukefGuaranteeInMonths: '10',
    guaranteeFeePayableByBank: '9.0000',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '10',
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

    const expected = {
      _id: mockFacility._id, // eslint-disable-line no-underscore-dangle
      associatedDealId: mockFacility.associatedDealId,
      ukefFacilityID: mockFacility.ukefFacilityID,
      facilityType: mockFacility.bondType,
      ukefFacilityType: mockFacilityType,
      facilityProduct: mapFacilityProduct(mockFacility),
      facilityStage: mapFacilityStage(mockFacilityStage),
      coveredPercentage: expectedCoveredPercentage,
      facilityValue: mapFacilityValue(mockFacility.currency, formattedFacilityValue, mockTfmFacility),
      facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      ukefExposure: mapUkefExposure(mockTfmFacility),
      bankFacilityReference: mapBankFacilityReference(mockFacility),
      guaranteeFeePayableToUkef: mapGuaranteeFeePayableToUkef(mockFacility.guaranteeFeePayableByBank, 4),
      bondIssuer: mockFacility.bondIssuer,
      bondBeneficiary: mockFacility.bondBeneficiary,
      dates: mapDates({
        ...mockFacility,
        facilityStage,
      }, mockDealDetails),
    };

    expect(result).toEqual(expected);
  });

  describe('when facility is a loan', () => {
    it('should capitalize facilityType', () => {
      const mockLoan = {
        ...mockFacility,
        bondType: null,
        facilityType: 'loan',
      };

      const result = mapFacility(mockLoan, mockTfmFacility, mockDealDetails);

      expect(result.facilityType).toEqual(capitalizeFirstLetter('loan'));
    });
  });
});

const mapFacility = require('./mapFacility');
const { formattedNumber } = require('../../../../utils/number');
const { capitalizeFirstLetter } = require('../../../../utils/string');
const mapFacilityProduct = require('./mapFacilityProduct');
const mapFacilityStage = require('./mapFacilityStage');
const mapBankFacilityReference = require('./mapBankFacilityReference');
const mapGuaranteeFeePayableToUkef = require('./mapGuaranteeFeePayableToUkef');
const mapDates = require('./mapDates');
const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal');

describe('mapFacility', () => {
  const mockDealDetails = MOCK_DEAL.details;

  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '02',
    'coverEndDate-year': '2021',
  };

  const mockUkefExposure = '1,234.00';
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
    ukefExposure: mockUkefExposure,
    coveredPercentage: mockCoveredPercentage,
    bondType: 'Performance Bond',
    currency: mockCurrency,
    facilityValue: mockFacilityValue,
    facilityStage: mockFacilityStage,
    bankReferenceNumber: '123456',
    bondIssuer: 'Issuer',
    bondBeneficiary: 'test',

    // fields we do not consume
    ukefGuaranteeInMonths: '10',
    guaranteeFeePayableByBank: '9.0000',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '10',
    minimumRiskMarginFee: '30',
    feeType: 'At maturity',
    dayCountBasis: '365',
  };

  it('should map and format correct fields/values', async () => {
    const result = mapFacility(mockFacility, mockDealDetails);

    const expectedUkefExposure = `${mockCurrency.id} ${mockUkefExposure}`;
    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const formattedFacilityValue = formattedNumber(mockFacilityValue);

    const expectedFacilityValue = `${mockCurrency.id} ${formattedFacilityValue}`;

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
      ukefExposure: expectedUkefExposure,
      coveredPercentage: expectedCoveredPercentage,
      facilityValue: expectedFacilityValue,
      facilityValueExportCurrency: expectedFacilityValueExportCurrency,
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

      const result = mapFacility(mockLoan, mockDealDetails);

      expect(result.facilityType).toEqual(capitalizeFirstLetter('loan'));
    });
  });

  describe('when facility.currency is NOT GBP', () => {
    it('should return facilityValue as empty string', () => {
      const mockFacilityNotGBP = {
        ...mockFacility,
        currency: {
          text: 'USD - US Dollars',
          id: 'USD',
        },
      };

      const result = mapFacility(mockFacilityNotGBP, mockDealDetails);

      expect(result.facilityValue).toEqual('');
    });
  });
});

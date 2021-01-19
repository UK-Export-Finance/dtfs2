const moment = require('moment');
const mapFacilities = require('./mapFacilities');
const { formattedNumber } = require('../../utils/number');
const mapFacilityStage = require('./mappings/facilities/mapFacilityStage');
const mapCoverEndDate = require('./mappings/facilities/mapCoverEndDate');

describe('mapFacilities', () => {
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

  const mockFacilities = [
    {
      _id: '12345678',
      facilityType: 'bond',
      ...mockCoverEndDate,
      ukefExposure: mockUkefExposure,
      coveredPercentage: mockCoveredPercentage,
      bondType: 'Performance Bond',
      currency: mockCurrency,
      facilityValue: mockFacilityValue,
      facilityStage: 'Unissued',

      // fields we do not consume
      bondIssuer: 'Issuer',
      ukefGuaranteeInMonths: '10',
      bondBeneficiary: 'test',
      guaranteeFeePayableByBank: '9.0000',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '10',
      minimumRiskMarginFee: '30',
      feeType: 'At maturity',
      dayCountBasis: '365',
    },
    {
      _id: '23456789',
      facilityType: 'loan',
      ...mockCoverEndDate,
      ukefExposure: mockUkefExposure,
      coveredPercentage: mockCoveredPercentage,
      currency: mockCurrency,
      facilityValue: mockFacilityValue,
      facilityStage: 'Conditional',

      // fields we do not consume
      createdDate: 1610369832226.0,
      ukefGuaranteeInMonths: '12',
      bankReferenceNumber: '5678',
      guaranteeFeePayableByBank: '27.0000',
      lastEdited: 1610369832226.0,
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '30',
      minimumQuarterlyFee: '10',
      premiumType: 'At maturity',
      dayCountBasis: '365',
      'issuedDate-day': '25',
      'issuedDate-month': '08',
      'issuedDate-year': '2020',
      disbursementAmount: '1,234.00',
      issueFacilityDetailsStarted: true,
      bankReferenceNumberRequiredForIssuance: true,
      requestedCoverStartDate: 1610369832226.0,
      issuedDate: 1610369832226.0,
      issueFacilityDetailsProvided: true,
      status: 'Acknowledged',
      ukefFacilityID: '65432',
    },
  ];

  it('should map and format correct fields/values', async () => {
    const result = mapFacilities(mockFacilities);

    const expectedUkefExposure = `${mockCurrency.id} ${mockUkefExposure}`;
    const expectedCoveredPercentage = `${mockCoveredPercentage}%`;

    const formattedFacilityValue = formattedNumber(mockFacilityValue);

    const expectedFacilityValue = `${mockCurrency.id} ${formattedFacilityValue}`;

    const expectedFacilityValueExportCurrency = `${mockCurrency.id} ${formattedFacilityValue}`;

    const expected = [
      {
        _id: mockFacilities[0]._id, // eslint-disable-line no-underscore-dangle
        facilityProduct: 'BSS',
        facilityType: mockFacilities[0].bondType,
        facilityStage: mapFacilityStage(mockFacilities[0].facilityStage),
        coverEndDate: mapCoverEndDate({ ...mockCoverEndDate }),
        ukefExposure: expectedUkefExposure,
        coveredPercentage: expectedCoveredPercentage,
        facilityValue: expectedFacilityValue,
        facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      },
      {
        _id: mockFacilities[1]._id, // eslint-disable-line no-underscore-dangle
        facilityType: null,
        facilityStage: mapFacilityStage(mockFacilities[1].facilityStage),
        facilityProduct: 'EWCS',
        coverEndDate: mapCoverEndDate({ ...mockCoverEndDate }),
        ukefExposure: expectedUkefExposure,
        coveredPercentage: expectedCoveredPercentage,
        facilityValue: expectedFacilityValue,
        facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('when facility.currency is NOT GBP', () => {
    it('should return facilityValue as empty string', () => {
      const result = mapFacilities([
        {
          ...mockFacilities[0],
          currency: {
            text: 'USD - US Dollars',
            id: 'USD',
          },
        },
      ]);

      expect(result[0].facilityValue).toEqual('');
    });
  });
});

const moment = require('moment');
const mapFacilities = require('./mapFacilities');
const { formattedNumber } = require('../../utils/number');

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

      // fields we do not consume
      bondIssuer: 'Issuer',
      facilityStage: 'Unissued',
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

      // fields we do not consume
      createdDate: 1610369832226.0,
      facilityStage: 'Conditional',
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

    const coverEndDate = moment().set({
      date: Number(mockCoverEndDate['coverEndDate-day']),
      month: Number(mockCoverEndDate['coverEndDate-month']) - 1, // months are zero indexed
      year: Number(mockCoverEndDate['coverEndDate-year']),
    });

    const expectedCoverEndDate = moment(coverEndDate).format('D MMM YYYY');

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
        coverEndDate: expectedCoverEndDate,
        ukefExposure: expectedUkefExposure,
        coveredPercentage: expectedCoveredPercentage,
        facilityValue: expectedFacilityValue,
        facilityValueExportCurrency: expectedFacilityValueExportCurrency,
      },
      {
        _id: mockFacilities[1]._id, // eslint-disable-line no-underscore-dangle
        facilityType: null,
        facilityProduct: 'EWCS',
        coverEndDate: expectedCoverEndDate,
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

  describe('when a facility does NOT have coverEndDate', () => {
    it('should not return coverEndDate', () => {
      const result = mapFacilities([
        {
          _id: '23456789',
          facilityType: 'loan',
          ukefExposure: mockUkefExposure,
          coveredPercentage: mockCoveredPercentage,
          currency: mockCurrency,
          facilityValue: mockFacilityValue,
          'coverEndDate-day': '',
          'coverEndDate-month': '',
          'coverEndDate-year': '',
        },
      ]);

      expect(result[0].coverEndDate).toEqual(undefined);
    });
  });
});

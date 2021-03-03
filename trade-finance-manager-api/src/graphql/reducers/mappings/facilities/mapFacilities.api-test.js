const mapFacilities = require('./mapFacilities');
const mapFacility = require('./mapFacility');
const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal');

describe('mapFacilities', () => {
  const mockTfmFacility = {};
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

  const MOCK_FACILITIES = [
    {
      _id: '12345678',
      facilitySnapshot: {
        _id: '12345678',
        ukefFacilityID: '0040004833',
        associatedDealId: '123456789',
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
      tfm: mockTfmFacility,
    },
    {
      _id: '23456789',
      facilitySnapshot: {
        _id: '23456789',
        ukefFacilityID: '0040004833',
        associatedDealId: '123456789',
        facilityType: 'loan',
        ...mockCoverEndDate,
        ukefExposure: mockUkefExposure,
        coveredPercentage: mockCoveredPercentage,
        currency: mockCurrency,
        facilityValue: mockFacilityValue,
        facilityStage: 'Conditional',
        requestedCoverStartDate: 1610369832226.0,
        issuedDate: 1610369832226.0,


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
        disbursementAmount: '1,234.00',
        issueFacilityDetailsStarted: true,
        bankReferenceNumberRequiredForIssuance: true,
        issueFacilityDetailsProvided: true,
        status: 'Acknowledged',
      },
      tfm: mockTfmFacility,
    },
  ];

  const mockFacilities = [
    { ...MOCK_FACILITIES[0] },
    { ...MOCK_FACILITIES[1] },
  ];

  it('should map and format correct fields/values', async () => {
    const result = mapFacilities(mockFacilities, mockDealDetails);

    const expected = [
      {
        _id: MOCK_FACILITIES[0]._id, // eslint-disable-line no-underscore-dangle
        facilitySnapshot: { ...mapFacility(MOCK_FACILITIES[0].facilitySnapshot, mockTfmFacility, mockDealDetails) },
        tfm: mockTfmFacility,
      },
      {
        _id: MOCK_FACILITIES[1]._id, // eslint-disable-line no-underscore-dangle
        facilitySnapshot: { ...mapFacility(MOCK_FACILITIES[1].facilitySnapshot, mockTfmFacility, mockDealDetails) },
        tfm: mockTfmFacility,
      },
    ];

    expect(result).toEqual(expected);
  });
});

const mapFacilities = require('./mapFacilities');
const mapFacility = require('./mapFacility');
const mapFacilityTfm = require('./mapFacilityTfm');
const MOCK_DEAL = require('../../../../v1/__mocks__/mock-deal');

describe('mapFacilities', () => {
  const mockTfmFacility = {
    ukefExposure: '1,234.00',
    ukefExposureCalculationTimestamp: '1606900616651',
  };

  const mockDealDetails = MOCK_DEAL.details;

  const MOCK_DEAL_TFM = {
    exporterCreditRating: 'Good (BB-)',
  };

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

  const MOCK_FACILITIES = [
    {
      _id: '12345678',
      facilitySnapshot: {
        _id: '12345678',
        ukefFacilityId: '0040004833',
        dealId: '123456789',
        type: 'Bond',
        ...mockCoverEndDate,
        coveredPercentage: mockCoveredPercentage,
        bondType: 'Performance Bond',
        currency: mockCurrency,
        value: mockFacilityValue,
        facilityStage: 'Unissued',
        hasBeenIssued: false,
        ukefExposure: '1,234.00',
        riskMarginFee: '10',
        ukefGuaranteeInMonths: '10',

        // fields we do not consume
        bondIssuer: 'Issuer',
        bondBeneficiary: 'test',
        guaranteeFeePayableByBank: '9.0000',
        currencySameAsSupplyContractCurrency: 'true',
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
        ukefFacilityId: '0040004833',
        dealId: '123456789',
        type: 'Loan',
        ...mockCoverEndDate,
        coveredPercentage: mockCoveredPercentage,
        currency: mockCurrency,
        value: mockFacilityValue,
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        requestedCoverStartDate: 1610369832226.0,
        issuedDate: 1610369832226.0,
        ukefExposure: '1,234.00',
        interestMarginFee: '30',
        ukefGuaranteeInMonths: '12',

        // fields we do not consume
        createdDate: 1610369832226.0,
        name: '5678',
        guaranteeFeePayableByBank: '27.0000',
        updatedAt: 1610369832226.0,
        currencySameAsSupplyContractCurrency: 'true',
        minimumQuarterlyFee: '10',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        disbursementAmount: '1,234.00',
        issueFacilityDetailsStarted: true,
        nameRequiredForIssuance: true,
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
    const result = mapFacilities(mockFacilities, mockDealDetails, MOCK_DEAL_TFM);

    const expected = [
      {
        _id: MOCK_FACILITIES[0]._id,
        facilitySnapshot: { ...mapFacility(MOCK_FACILITIES[0].facilitySnapshot, mockTfmFacility, mockDealDetails) },
        tfm: mapFacilityTfm(mockTfmFacility, MOCK_DEAL_TFM),
      },
      {
        _id: MOCK_FACILITIES[1]._id,
        facilitySnapshot: { ...mapFacility(MOCK_FACILITIES[1].facilitySnapshot, mockTfmFacility, mockDealDetails) },
        tfm: mapFacilityTfm(mockTfmFacility, MOCK_DEAL_TFM),
      },
    ];

    expect(result).toEqual(expected);
  });
});

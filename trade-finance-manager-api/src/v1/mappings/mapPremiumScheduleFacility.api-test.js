const mapPremiumScheduleFacility = require('./mapPremiumScheduleFacility');
const { stripCommas } = require('../../utils/string');

// TODO: improve test coverage.

const mockBond = {
  _id: '1000533',
  facilityType: 'bond',
  'coverEndDate-day': '14',
  'coverEndDate-month': '05',
  'coverEndDate-year': '2022',
  facilityStage: 'Issued',
  requestedCoverStartDate: '1618495991398',
  ukefGuaranteeInMonths: null,
  uniqueIdentificationNumber: '1234',
  conversionRate: '100',
  'conversionRateDate-day': '10',
  'conversionRateDate-month': '04',
  'conversionRateDate-year': '2021',
  currency: {
    id: 'EUR',
    text: 'EUR - Euros',
    currencyId: 11,
  },
  currencySameAsSupplyContractCurrency: 'false',
  value: '2400.00',
  createdDate: '1618409496358',
  associatedDealId: '1000842',
  bondBeneficiary: '',
  bondIssuer: '',
  bondType: 'Advance payment guarantee',
  lastEdited: '1618409747361',
  'requestedCoverStartDate-day': '15',
  'requestedCoverStartDate-month': '04',
  'requestedCoverStartDate-year': '2021',
  ukefExposure: '1,920.00',
  coverPercentage: '80',
  guaranteeFeePayableByBank: '1.0800',
  minimumRiskMarginFee: '',
  riskMarginFee: '1.2',
  dayCountBasis: '360',
  feeFrequency: 'Monthly',
  feeType: 'In advance',
  viewedPreviewPage: true,
  issueFacilityDetailsSubmitted: true,
  issuedFacilitySubmittedToUkefBy: {
    _id: '607699d57cda0c0013a13c62',
    bank: {
      emails: [
        'checker@ukexportfinance.gov.uk',
      ],
      id: '9',
      name: 'UKEF test bank (Delegated)',
    },
    email: 'checker1@ukexportfinance.gov.uk',
    firstname: 'Emilio',
    lastLogin: '1618409733041',
    roles: [
      'checker',
    ],
    surname: 'Largo',
    timezone: 'Europe/London',
    'user-status': 'active',
    username: 'checker1@ukexportfinance.gov.uk',
  },
  issuedFacilitySubmittedToUkefTimestamp: '1618409745675',
  status: 'Completed',
  ukefFacilityID: '0030020192',
};

const mockLoan = {
  _id: '1001477',
  ukefGuaranteeInMonths: '24',
  bankReferenceNumber: 'Default date',
  value: '100000.00',
  currencySameAsSupplyContractCurrency: 'true',
  createdDate: '1606900241008',
  facilityStage: 'Unconditional',
  guaranteeFeePayableByBank: '1.8000',
  ukefExposure: '80,000.00',
  lastEdited: '1606914139619',
  interestMarginFee: '2',
  coverPercentage: '80',
  premiumFrequency: 'Quarterly',
  premiumType: 'In arrear',
  dayCountBasis: '365',
  currency: {
    text: 'GBP - UK Sterling',
    id: 'GBP',
  },
  ukefFacilityID: '0040004838',
  'issuedDate-day': '02',
  'issuedDate-month': '12',
  'issuedDate-year': '2020',
  'requestedCoverStartDate-day': '',
  'requestedCoverStartDate:-month': '',
  'requestedCoverStartDate-year': '',
  'coverEndDate-day': '02',
  'coverEndDate-month': '12',
  'coverEndDate-year': '2022',
  disbursementAmount: '50,000.00',
  issueFacilityDetailsStarted: true,
  bankReferenceNumberRequiredForIssuance: true,
  issuedDate: '1606914132468',
  issueFacilityDetailsProvided: true,
  previousFacilityStage: 'Conditional',
  status: 'Completed',
  requestedCoverStartDate: '1606914132468',
};

describe('Premium schedule', () => {
  const mockFacilityExposurePeriod = {
    exposurePeriodInMonths: 25,
  };

  const mockFacilityGuaranteeDates = {
    guaranteeCommencementDate: '2021-05-01',
    guaranteeExpiryDate: '2023-05-01',
  };

  describe('All facilities', () => {
    it('should return null if facilityExposurePeriod is null', () => {
      const facility = {};
      const facilityExposurePeriod = null;
      const facilityGuaranteeDates = null;
      const result = mapPremiumScheduleFacility(facility, facilityExposurePeriod, facilityGuaranteeDates);
      const expected = null;
      expect(result).toEqual(expected);
    });

    it('should return null if dates are null', () => {
      const facility = {};
      const facilityExposurePeriod = 25;
      const facilityGuaranteeDates = null;
      const result = mapPremiumScheduleFacility(facility, facilityExposurePeriod, facilityGuaranteeDates);
      const expected = null;
      expect(result).toEqual(expected);
    });
  });
  describe('Bond', () => {
    it('should return valid parameters', () => {
      const facility = mockBond;

      const result = mapPremiumScheduleFacility(facility, mockFacilityExposurePeriod, mockFacilityGuaranteeDates);

      const expected = {
        cumulativeAmount: 0,
        dayBasis: '360',
        exposurePeriod: 25,
        facilityURN: 30020192,
        guaranteeCommencementDate: '2021-05-01',
        guaranteeExpiryDate: '2023-05-01',
        guaranteeFeePercentage: 1.08,
        guaranteePercentage: 80,
        maximumLiability: 1920,
        premiumFrequencyId: 1,
        premiumTypeId: 1,
        productGroup: 'BS',
      };
      expect(result).toEqual(expected);
    });
  });

  describe('Loan', () => {
    it('should map cumulativeAmount', () => {
      const result = mapPremiumScheduleFacility(mockLoan, mockFacilityExposurePeriod, mockFacilityGuaranteeDates);

      const expected = Number(stripCommas(mockLoan.disbursementAmount));

      expect(result.cumulativeAmount).toEqual(expected);
    });
  });
});

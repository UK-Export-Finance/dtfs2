const mockDeal = {
  _id: '64ef48ee17a3231be0ad48b3',
  additionalRefName: 'Mock deal',
  mandatoryCriteria: [],
  status: 'Draft',
  details: {
    status: 'Draft',
    submissionDate: undefined,
  },
  submissionDetails: {
    'supplier-type': 'uk-company',
    'supplier-companies-house-registration-number': '01234567',
    'supplier-name': 'Mock supplier',
    'supplier-address-country': { code: 'GBR', name: 'United Kingdom' },
    'supplier-address-line-1': '1 Mock Street',
    'supplier-address-line-2': '',
    'supplier-address-line-3': '',
    'supplier-address-town': 'London',
    'supplier-address-postcode': 'SW1A 1AA',
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-country': { code: 'GBR', name: 'United Kingdom' },
    'supplier-correspondence-address-line-1': '',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-line-3': '',
    'supplier-correspondence-address-town': '',
    'supplier-correspondence-address-postcode': '',
    'industry-sector': { code: 'A', name: 'Agriculture' },
    'industry-class': { code: 'A1', name: 'Crop production' },
    'sme-type': 'sme',
    'supply-contract-description': 'Mock supply contract',
    legallyDistinct: 'false',
    'indemnifier-companies-house-registration-number': '',
    'indemnifier-name': '',
    'indemnifier-address-country': '',
    'indemnifier-address-line-1': '',
    'indemnifier-address-line-2': '',
    'indemnifier-address-line-3': '',
    'indemnifier-address-town': '',
    'indemnifier-address-postcode': '',
    indemnifierCorrespondenceAddressDifferent: '',
    'indemnifier-correspondence-address-country': '',
    'indemnifier-correspondence-address-line-1': '',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-line-3': '',
    'indemnifier-correspondence-address-town': '',
    'indemnifier-correspondence-address-postcode': '',
    'buyer-name': 'Mock buyer',
    'buyer-address-country': { code: 'GBR', name: 'United Kingdom' },
    'buyer-address-line-1': '2 Buyer Street',
    'buyer-address-line-2': '',
    'buyer-address-line-3': '',
    'buyer-address-town': 'London',
    'buyer-address-postcode': 'SW1A 2AA',
    destinationOfGoodsAndServices: { code: 'GBR', name: 'United Kingdom' },
    supplyContractValue: '1000',
    supplyContractCurrency: { id: 'GBP', text: 'GBP' },
    supplyContractConversionRateToGBP: '',
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': '',
  },
  bondTransactions: { items: [] },
  loanTransactions: { items: [] },
  eligibility: {
    status: 'Incomplete',
    criteria: [],
    validationErrors: { count: 0, errorList: {} },
    agentAddressCountry: null,
    agentName: '',
    agentAddressLine1: '',
    agentAddressLine2: '',
    agentAddressLine3: '',
    agentAddressTown: '',
    agentAddressPostcode: '',
  },
  supportingInformation: {
    validationErrors: { count: 0, errorList: {} },
    securityDetails: { exporter: '' },
    exporterQuestionnaire: [],
    auditedFinancialStatements: [],
    yearToDateManagement: [],
    financialForecasts: [],
    financialInformationCommentary: [],
    corporateStructure: [],
  },
};

const mockBond = {
  status: "Maker's input required",
  facilityStage: 'Unissued',
  issueFacilityDetailsSubmitted: false,
  currency: { id: 'GBP', text: 'GBP' },
  value: '1000',
  requestedCoverStartDate: '2024-01-01T00:00:00.000Z',
  'requestedCoverStartDate-day': '1',
  'requestedCoverStartDate-month': '1',
  'requestedCoverStartDate-year': '2024',
};

const mockLoan = {
  status: "Maker's input required",
  facilityStage: 'Unconditional',
  issueFacilityDetailsSubmitted: false,
  currency: { id: 'GBP', text: 'GBP' },
  value: '1000',
  currencySameAsSupplyContractCurrency: 'true',
  interestMarginFee: '1',
  coveredPercentage: '80',
  premiumType: 'With a schedule',
  premiumFrequency: '6 months',
  dayCountBasis: '30/360',
  requestedCoverStartDate: '2024-01-01T00:00:00.000Z',
  'requestedCoverStartDate-day': '1',
  'requestedCoverStartDate-month': '1',
  'requestedCoverStartDate-year': '2024',
};

const mockCountries = [{ code: 'GBR', name: 'United Kingdom' }];
const mockIndustrySectors = [
  {
    code: 'A',
    name: 'Agriculture',
    classes: [{ code: 'A1', name: 'Crop production' }],
  },
];
const mockCurrencies = [{ id: 'GBP', text: 'GBP' }];

const mockProvide = () => {
  jest.mock('../../server/routes/api-data-provider', () => ({
    ...jest.requireActual('../../server/routes/api-data-provider'),
    provide: (listOfDataTypes) => async (req, res, next) => {
      req.apiData = req.apiData || {};

      if (listOfDataTypes.includes('deal')) {
        const isIssueFacilityRoute = req.originalUrl.includes('/bond/') && req.originalUrl.includes('/issue-facility');
        const isLoanIssueFacilityRoute = req.originalUrl.includes('/loan/') && req.originalUrl.includes('/issue-facility');

        req.apiData.deal =
          isIssueFacilityRoute || isLoanIssueFacilityRoute
            ? {
                ...mockDeal,
                status: 'Accepted by UKEF (with conditions)',
                details: {
                  status: 'Accepted by UKEF (with conditions)',
                  submissionDate: '2024-01-01T00:00:00.000Z',
                },
                submissionType: 'Automatic Inclusion Notice',
              }
            : mockDeal;
      }

      if (listOfDataTypes.includes('loan')) {
        const isIssueFacilityRoute = req.originalUrl.includes('/loan/') && req.originalUrl.includes('/issue-facility');

        req.apiData.loan = {
          dealId: mockDeal._id,
          loan: isIssueFacilityRoute
            ? {
                ...mockLoan,
                status: "Maker's input required",
                facilityStage: 'Unconditional',
              }
            : {
                ...mockLoan,
                status: 'Not started',
              },
          validationErrors: { count: 0, errorList: {} },
        };
      }

      if (listOfDataTypes.includes('industrySectors')) {
        req.apiData.industrySectors = mockIndustrySectors;
      }

      if (listOfDataTypes.includes('countries')) {
        req.apiData.countries = mockCountries;
      }

      if (listOfDataTypes.includes('currencies')) {
        req.apiData.currencies = mockCurrencies;
      }

      if (listOfDataTypes.includes('bond')) {
        const isIssueFacilityRoute = req.originalUrl.includes('/bond/') && req.originalUrl.includes('/issue-facility');

        req.apiData.bond = {
          dealId: mockDeal._id,
          bond: isIssueFacilityRoute
            ? {
                ...mockBond,
              }
            : {
                ...mockBond,
                status: 'Not started',
              },
          validationErrors: { count: 0, errorList: {} },
        };
      }

      return next();
    },
  }));
};

module.exports = mockProvide;

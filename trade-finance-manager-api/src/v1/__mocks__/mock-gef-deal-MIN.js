const MOCK_CASH_CONTINGENT_FACILITIES = require('./mock-cash-contingent-facilities');

const MOCK_GEF_DEAL = {
  _id: 'MOCK_GEF_DEAL',
  dealType: 'GEF',
  additionalRefName: 'Additional Reference 001',
  bankInternalRefName: 'Internal Reference 001',
  submissionDate: '1626169888809',
  submissionCount: 1,
  submissionType: 'Manual Inclusion Notice',
  coverTerms: {
    coverStart: 'true',
    dueDiligence: 'true',
    exporterDeclaration: 'true',
    facilityBaseCurrency: 'true',
    facilityLetter: 'true',
    facilityLimit: 'true',
    facilityPaymentCurrency: 'true',
    noticeDate: 'true',
  },
  createdAt: 1625827333471,
  exporter: {
    companiesHouseRegistrationNumber: '10686321',
    companyName: 'FOUNDRY4 CONSULTING LTD',
    correspondenceAddress: null,
    createdAt: 1625827333468,
    industries: [
      {
        code: '1009',
        name: 'Information and communication',
        class: {
          code: '62020',
          name: 'Information technology consultancy activities',
        },
      },
    ],
    isFinanceIncreasing: false,
    probabilityOfDefault: 14,
    registeredAddress: {
      organisationName: null,
      addressLine1: '7 Savoy Court',
      addressLine2: null,
      addressLine3: null,
      locality: 'London',
      postalCode: 'WC2R 0EX',
      country: 'United Kingdom',
    },
    selectedIndustry: {
      code: '1009',
      name: 'Information and communication',
      class: {
        code: '62020',
        name: 'Information technology consultancy activities',
      },
    },
    smeType: 'MEDIUM',
    updatedAt: 162582748022,
  },
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: [
      'maker1@ukexportfinance.gov.uk',
      'checker1@ukexportfinance.gov.uk',
    ],
  },
  mandatoryVersionId: null,
  status: 'SUBMITTED_TO_UKEF',
  updatedAt: null,
  userId: '60e705d74cf03e0013d38395',
  checkerId: '60a705d74bf03d1300d96383',
  comments: [
    {
      createdAt: 1625482095783,
      userName: 'Sample User',
      comment: 'Sample comment',
    },
  ],
  facilities: MOCK_CASH_CONTINGENT_FACILITIES,
};

module.exports = MOCK_GEF_DEAL;

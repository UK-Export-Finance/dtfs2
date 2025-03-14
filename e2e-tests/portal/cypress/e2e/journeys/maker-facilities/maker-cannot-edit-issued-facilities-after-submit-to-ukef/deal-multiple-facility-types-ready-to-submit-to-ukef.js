const { BOND_TYPE, CURRENCY } = require('@ukef/dtfs2-common');
const { mandatoryCriteria } = require('../../../../../../e2e-fixtures');
const { oneMonth, twoMonths } = require('../../../../../../e2e-fixtures/dateConstants');

const now = new Date().valueOf();
const nowPlusOneMonth = oneMonth.unixMillisecondsString;
const nowPlusTwoMonthsDay = twoMonths.dayLong;
const nowPlusTwoMonthsMonth = twoMonths.monthLong;
const nowPlusTwoMonthsYear = twoMonths.year;

const deal = {
  submissionType: 'Automatic Inclusion Notice',
  updatedAt: Date.now(),
  bankInternalRefName: 'test',
  additionalRefName: 'test',
  status: "Ready for Checker's approval",
  previousStatus: 'Draft',
  bank: {
    id: '9',
    name: 'UKEF test bank (Delegated)',
    emails: ['maker@ukexportfinance.gov.uk', 'checker@ukexportfinance.gov.uk'],
  },
  maker: {
    username: 'MAKER',
    roles: ['maker'],
    bank: {
      id: '9',
      name: 'UKEF test bank (Delegated)',
      emails: ['maker@ukexportfinance.gov.uk', 'checker@ukexportfinance.gov.uk'],
    },
    lastLogin: now,
    firstname: 'Hugo',
    surname: 'Drax',
    email: 'maker@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    'user-status': 'active',
  },
  details: {
    created: '1598021253917',
  },
  eligibility: {
    status: 'Completed',
    version: 7,
    product: 'BSS/EWCS',
    isInDraft: false,
    createdAt: 1702061978881,
    criteria: [
      {
        id: 11,
        description:
          'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 12,
        description:
          'The period between the Cover Start Date and the Cover End Date does not exceed: for a Bond, the Bond Maximum Cover Period; and for a Loan, the Loan Maximum Cover Period.',
        answer: true,
      },
      {
        id: 13,
        description:
          'The Covered Bank Exposure under the Transaction (converted (as at the date this representation is made) for this purpose into the Base Currency) is not more than the lesser of: the Available Facility; and the Available Obligor Covered Exposure Limit.',
        answer: true,
      },
      {
        id: 14,
        description:
          'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true,
      },
      {
        id: 15,
        description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: true,
      },
      {
        id: 16,
        description:
          'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco, gambling, coal, oil, gas or fossil fuel energy and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 17,
        description:
          'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true,
      },
      {
        id: 18,
        description:
          "Any applicable fees, interest rate and/or Risk Margin Fee apply to the whole Cover Period of the Covered Transaction, and have been set in accordance with the Bank's normal pricing policies and include, if any, overall pricing requirements notified by UKEF.",
        answer: true,
      },
    ],
    agentAddressCountry: '',
    agentAddressLine1: '',
    agentAddressLine2: '',
    agentAddressLine3: '',
    agentAddressPostcode: '',
    agentAddressTown: '',
    agentName: '',
    validationErrors: {
      count: 0,
      errorList: {
        11: {},
        12: {},
        13: {},
        14: {},
        15: {},
        16: {},
        17: {},
        18: {},
        agentAddressCountry: {},
        agentAddressLine1: {},
        agentAddressPostcode: {},
        agentAddressTown: {},
        agentName: {},
      },
    },
  },
  submissionDetails: {
    status: 'Incomplete',
    'indemnifier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-address-line-1': '',
    'indemnifier-address-line-2': '',
    'indemnifier-address-line-3': '',
    'indemnifier-address-postcode': '',
    'indemnifier-address-town': '',
    'indemnifier-companies-house-registration-number': '',
    'indemnifier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-correspondence-address-line-1': '',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-line-3': '',
    'indemnifier-correspondence-address-postcode': '',
    'indemnifier-correspondence-address-town': '',
    'indemnifier-name': '',
    'industry-class': {
      code: '56101',
      name: 'Licensed restaurants',
    },
    'industry-sector': {
      code: '1008',
      name: 'Accommodation and food service activities',
    },
    legallyDistinct: 'false',
    'sme-type': 'Micro',
    'supplier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-address-line-1': 'test',
    'supplier-address-line-2': 'test',
    'supplier-address-line-3': 'test',
    'supplier-address-postcode': 'test',
    'supplier-address-town': 'test',
    'supplier-companies-house-registration-number': '',
    'supplier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-line-1': '',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-line-3': '',
    'supplier-correspondence-address-postcode': '',
    'supplier-correspondence-address-town': '',
    'supplier-name': 'test',
    'supplier-type': 'Exporter',
    'supply-contract-description': 'test',
    'buyer-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'buyer-address-line-1': 'test',
    'buyer-address-line-2': 'test',
    'buyer-address-line-3': 'test',
    'buyer-address-postcode': 'test',
    'buyer-address-town': 'test',
    'buyer-name': 'test',
    destinationOfGoodsAndServices: {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': '',
    supplyContractConversionRateToGBP: '',
    supplyContractCurrency: {
      id: CURRENCY.GBP,
      text: 'GBP - UK Sterling',
    },
    supplyContractValue: '1234.00',
  },
  bondTransactions: {
    items: [
      {
        type: 'Bond',
        createdDate: now,
        bondIssuer: '',
        bondType: BOND_TYPE.ADVANCE_PAYMENT_GUARANTEE,
        facilityStage: 'Issued',
        hasBeenIssued: true,
        'requestedCoverStartDate-day': '',
        'requestedCoverStartDate-month': '',
        'requestedCoverStartDate-year': '',
        'coverEndDate-day': nowPlusTwoMonthsDay,
        'coverEndDate-month': nowPlusTwoMonthsMonth,
        'coverEndDate-year': nowPlusTwoMonthsYear,
        name: '1234',
        bondBeneficiary: '',
        guaranteeFeePayableByBank: '18.0000',
        updatedAt: Date.now(),
        value: '1234.00',
        currencySameAsSupplyContractCurrency: 'true',
        riskMarginFee: '20',
        coveredPercentage: '30',
        minimumRiskMarginFee: '',
        ukefExposure: '370.20',
        feeType: 'At maturity',
        dayCountBasis: '365',
        currency: {
          text: 'GBP - UK Sterling',
          id: CURRENCY.GBP,
        },
        requestedCoverStartDate: nowPlusOneMonth,
      },
    ],
  },
  loanTransactions: {
    items: [
      {
        type: 'Loan',
        createdDate: now,
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        'requestedCoverStartDate-day': '',
        'requestedCoverStartDate-month': '',
        'requestedCoverStartDate-year': '',
        'coverEndDate-day': nowPlusTwoMonthsDay,
        'coverEndDate-month': nowPlusTwoMonthsMonth,
        'coverEndDate-year': nowPlusTwoMonthsYear,
        name: '12345678',
        guaranteeFeePayableByBank: '10.8000',
        updatedAt: Date.now(),
        value: '1234.00',
        currencySameAsSupplyContractCurrency: 'true',
        disbursementAmount: '123.00',
        interestMarginFee: '12',
        coveredPercentage: '24',
        minimumQuarterlyFee: '',
        ukefExposure: '296.16',
        premiumType: 'At maturity',
        dayCountBasis: '365',
        currency: {
          text: 'GBP - UK Sterling',
          id: CURRENCY.GBP,
        },
        requestedCoverStartDate: nowPlusOneMonth,
      },
    ],
  },
  summary: {},
  comments: [
    {
      user: {
        username: 'MAKER',
        roles: ['maker'],
        bank: {
          id: '9',
          name: 'UKEF test bank (Delegated)',
          emails: ['maker@ukexportfinance.gov.uk', 'checker@ukexportfinance.gov.uk'],
        },
        lastLogin: '1598021249183',
        firstname: 'Hugo',
        surname: 'Drax',
        email: 'maker@ukexportfinance.gov.uk',
        timezone: 'Europe/London',
        'user-status': 'active',
      },
      timestamp: now,
      text: 'test',
    },
  ],
  editedBy: [],
  mandatoryCriteria,
  supportingInformation: {
    validationErrors: {
      count: 0,
      errorList: {
        exporterQuestionnaire: {},
      },
    },
    exporterQuestionnaire: [
      {
        type: 'general_correspondence',
        fullPath: 'private-files/ukef_portal_storage/1000697/questionnaire copy.pdf',
        filename: 'questionnaire copy.pdf',
        mimetype: 'application/pdf',
      },
    ],
    securityDetails: {
      exporter: '',
    },
  },
};

module.exports = deal;

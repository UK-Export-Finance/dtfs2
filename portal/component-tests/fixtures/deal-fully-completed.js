const { subDays, addMonths, format } = require('date-fns');
const { CURRENCY } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../../server/constants');

const now = new Date();
const yesterday = subDays(now, 1);
const nextMonth = addMonths(now, 1);

const deal = {
  updatedAt: Date.now(),
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  status: "Ready for Checker's approval",
  previousStatus: 'Draft',
  maker: { username: 'some.user@client.com' },
  details: {
    submissionDate: 1594296776916.0,
  },
  comments: [
    {
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    },
    {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    },
  ],
  bondTransactions: {
    items: [
      {
        bondIssuer: 'my issuer',
        bondType: 'Retention bond',
        facilityStage: 'Issued',
        hasBeenIssued: true,
        ukefGuaranteeInMonths: '12',
        'requestedCoverStartDate-day': `${format(now, 'dd')}`,
        'requestedCoverStartDate-month': `${format(now, 'MM')}`,
        'requestedCoverStartDate-year': `${format(now, 'yyyy')}`,
        'coverEndDate-day': `${format(nextMonth, 'dd')}`,
        'coverEndDate-month': `${format(nextMonth, 'MM')}`,
        'coverEndDate-year': `${format(nextMonth, 'yyyy')}`,
        name: '1234567890',
        bondBeneficiary: 'test',
        status: 'Completed',
        value: '1234',
        currencySameAsSupplyContractCurrency: 'true',
        currency: {
          text: 'GBP - UK Sterling',
          id: CURRENCY.GBP,
        },
        conversionRate: '100',
        'conversionRateDate-day': `${format(yesterday, 'dd')}`,
        'conversionRateDate-month': `${format(yesterday, 'MM')}`,
        'conversionRateDate-year': `${format(yesterday, 'yyyy')}`,
        riskMarginFee: '12',
        coveredPercentage: '24',
        minimumRiskMarginFee: '1',
        feeType: 'In advance',
        feeFrequency: 'Quarterly',
        dayCountBasis: '360',
        guaranteeFeePayableByBank: '9.000',
        ukefExposure: '100',
      },
      {
        bondIssuer: 'my issuer',
        bondType: 'Retention bond',
        facilityStage: 'Issued',
        hasBeenIssued: true,
        ukefGuaranteeInMonths: '12',
        'requestedCoverStartDate-day': `${format(now, 'dd')}`,
        'requestedCoverStartDate-month': `${format(now, 'MM')}`,
        'requestedCoverStartDate-year': `${format(now, 'yyyy')}`,
        'coverEndDate-day': `${format(nextMonth, 'dd')}`,
        'coverEndDate-month': `${format(nextMonth, 'MM')}`,
        'coverEndDate-year': `${format(nextMonth, 'yyyy')}`,
        name: '1234567890',
        bondBeneficiary: 'test',
        status: 'Completed',
        value: '5678',
        currencySameAsSupplyContractCurrency: 'true',
        currency: {
          text: 'GBP - UK Sterling',
          id: CURRENCY.GBP,
        },
        conversionRate: '100',
        'conversionRateDate-day': `${format(yesterday, 'dd')}`,
        'conversionRateDate-month': `${format(yesterday, 'MM')}`,
        'conversionRateDate-year': `${format(yesterday, 'yyyy')}`,
        riskMarginFee: '12',
        coveredPercentage: '24',
        minimumRiskMarginFee: '1',
        feeType: 'In arrear',
        feeFrequency: 'Monthly',
        dayCountBasis: '360',
        guaranteeFeePayableByBank: '9.000',
        ukefExposure: '100',
      },
    ],
  },
  loanTransactions: {
    items: [
      {
        _id: '123456',
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        'requestedCoverStartDate-day': `${format(now, 'dd')}`,
        'requestedCoverStartDate-month': `${format(now, 'MM')}`,
        'requestedCoverStartDate-year': `${format(now, 'yyyy')}`,
        'coverEndDate-day': `${format(nextMonth, 'dd')}`,
        'coverEndDate-month': `${format(nextMonth, 'MM')}`,
        'coverEndDate-year': `${format(nextMonth, 'yyyy')}`,
        ukefGuaranteeInMonths: '12',
        name: '12345678',
        guaranteeFeePayableByBank: '10.8000',
        value: '12345678.00',
        currencySameAsSupplyContractCurrency: 'false',
        currency: {
          text: 'AUD - Australian Dollars',
          id: 'AUD',
        },
        conversionRate: '80',
        'conversionRateDate-day': `${format(yesterday, 'dd')}`,
        'conversionRateDate-month': `${format(yesterday, 'MM')}`,
        'conversionRateDate-year': `${format(yesterday, 'yyyy')}`,
        disbursementAmount: '100.00',
        interestMarginFee: '12',
        coveredPercentage: '30',
        minimumQuarterlyFee: '200',
        ukefExposure: '3,703,703.40',
        premiumFrequency: 'Semi-annually',
        premiumType: 'In advance',
        dayCountBasis: '365',
        status: 'Completed',
      },
      {
        _id: '789123',
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        'requestedCoverStartDate-day': `${format(now, 'dd')}`,
        'requestedCoverStartDate-month': `${format(now, 'MM')}`,
        'requestedCoverStartDate-year': `${format(now, 'yyyy')}`,
        'coverEndDate-day': `${format(nextMonth, 'dd')}`,
        'coverEndDate-month': `${format(nextMonth, 'MM')}`,
        'coverEndDate-year': `${format(nextMonth, 'yyyy')}`,
        ukefGuaranteeInMonths: '12',
        name: '12345678',
        guaranteeFeePayableByBank: '10.8000',
        value: '12345678.00',
        currencySameAsSupplyContractCurrency: 'false',
        currency: {
          text: 'AUD - Australian Dollars',
          id: 'AUD',
        },
        conversionRate: '80',
        'conversionRateDate-day': `${format(yesterday, 'dd')}`,
        'conversionRateDate-month': `${format(yesterday, 'MM')}`,
        'conversionRateDate-year': `${format(yesterday, 'yyyy')}`,
        disbursementAmount: '100.00',
        interestMarginFee: '12',
        coveredPercentage: '30',
        minimumQuarterlyFee: '200',
        ukefExposure: '3,703,703.40',
        premiumFrequency: 'Semi-annually',
        premiumType: 'In advance',
        dayCountBasis: '365',
        status: 'Completed',
      },
    ],
  },
  eligibility: {
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
    agentAddressLine1: 'ADDR 1',
    agentAddressLine2: 'Addr 2',
    agentAddressLine3: 'Addr 3',
    agentAddressCountry: 'GBR',
    agentName: 'AGENT NAME',
    agentAddressPostcode: 'CF64 5SH',
    agentAddressTown: 'City',
  },
  submissionDetails: {
    'indemnifier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-address-line-3': '',
    'indemnifier-address-line-1': '1A',
    'indemnifier-address-line-2': 'Test Road',
    'indemnifier-address-postcode': 'test',
    'indemnifier-address-town': 'London',
    'indemnifier-companies-house-registration-number': '06771815',
    'indemnifier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-correspondence-address-line-3': 'Essex',
    'indemnifier-correspondence-address-line-1': 'Test address',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-postcode': 'test',
    'indemnifier-correspondence-address-town': 'Chelmsford',
    'indemnifier-name': 'Test Trading Limited',
    indemnifierCorrespondenceAddressDifferent: 'true',
    'industry-sector': {
      code: '1008',
      name: 'Accommodation and food service activities',
    },
    'industry-class': {
      code: '56101',
      name: 'Licensed restaurants',
    },
    legallyDistinct: 'true',
    'sme-type': 'Small',
    'supplier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-address-line-3': 'London',
    'supplier-address-line-1': '1 Horseguards Road',
    'supplier-address-line-2': '',
    'supplier-address-postcode': 'test',
    'supplier-address-town': 'Westminster',
    'supplier-companies-house-registration-number': '',
    'supplier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-correspondence-address-line-3': 'Edinburgh',
    'supplier-correspondence-address-line-1': '2 Horseguards Road',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-postcode': 'ED1 23S',
    'supplier-correspondence-address-town': 'Eastminster',
    'supplier-name': 'UKEF',
    'supplier-type': 'Exporter',
    'supplier-correspondence-address-is-different': 'true',
    'supply-contract-description': 'Description.',
    'buyer-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'buyer-address-line-1': 'Corner of East and Main',
    'buyer-address-line-2': '',
    'buyer-address-line-3': 'The Bronx',
    'buyer-address-postcode': 'no-idea',
    'buyer-address-town': 'New York',
    'buyer-name': 'Harry Bear',
    destinationOfGoodsAndServices: {
      name: 'United States',
      code: 'USA',
    },
    viewedPreviewPage: true,
    supplyContractConversionRateToGBP: '1.123456',
    supplyContractCurrency: {
      id: 'USD',
      text: 'USD - US Dollars',
    },
    supplyContractValue: '10,000',
    supplyContractConversionDate: format(now, CONSTANTS.DATE.FULL_DATE),
  },
  summary: {
    totalValue: {
      dealInDealCurrency: '10,000',
      dealInGbp: '12,000',
      bondsInDealCurrency: '8,000',
      bondsInGbp: '16,000',
      loansInDealCurrency: '4,000',
      loansInGbp: '8,000',
    },
    totalUkefExposure: {
      dealInDealCurrency: '5,000',
      dealInGbp: '6,000',
      bondsInDealCurrency: '4,000',
      bondsInGbp: '8,000',
      loansInDealCurrency: '2,000',
      loansInGbp: '4,000',
    },
  },
  supportingInformation: {
    exporterQuestionnaire: [
      {
        type: 'general_correspondence',
        fullPath: 'private-files/ukef_portal_storage/1000256/exporterQuestionnaire/test-file-1.txt',
        filename: 'test-file-1.txt',
        mimetype: 'text/plain',
      },
      {
        type: 'general_correspondence',
        fullPath: 'private-files/ukef_portal_storage/1000256/exporterQuestionnaire/test-file-2.txt',
        filename: 'test-file-2.txt',
        mimetype: 'text/plain',
      },
    ],
    auditedFinancialStatements: [
      {
        type: 'financials',
        fullPath: 'private-files/ukef_portal_storage/1000256/auditedFinancialStatements/test-file-3.txt',
        filename: 'test-file-3.txt',
        mimetype: 'text/plain',
      },
    ],
    securityDetails: {
      exporter: 'security test',
    },
  },
  mandatoryCriteria: {
    version: 34,
    criteria: [
      {
        id: 1,
        title: 'Supply contract/Transaction',
        items: [
          {
            id: 1,
            copy: 'The Supplier has provided the Bank with a duly completed Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate.',
          },
          {
            id: 2,
            copy: 'The Bank has complied with its policies and procedures in relation to the Transaction.',
          },
          {
            id: 3,
            copy: 'Where the Supplier is a UK Supplier, the Supplier has provided the Bank with a duly completed UK Supplier Declaration, and the Bank is not aware that any of the information contained within it is inaccurate. (Conditional for UK Supplier)',
          },
        ],
      },
      {
        id: 2,
        title: 'Financial',
        items: [
          {
            id: 4,
            copy: 'Where the supplier is not a “Person Within Scope of Windsor Framework”, it is an eligible person OR',
          },
          {
            id: 5,
            copy: 'Where the supplier is a “Person Within Scope of Windsor Framework”, both it and its parent obligor (if any) is an eligible person.',
          },
        ],
      },
      {
        id: 3,
        title: 'Credit',
        items: [
          {
            id: 6,
            copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one-year probability of default of less than 14.1%.',
          },
        ],
      },
      {
        id: 4,
        title: 'Bank Facility Letter',
        items: [
          {
            id: 7,
            copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.',
          },
        ],
      },
      {
        id: 5,
        title: 'Legal',
        items: [
          {
            id: 8,
            copy: 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.',
          },
          {
            id: 9,
            copy: 'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
          },
          {
            id: 10,
            copy: 'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
          },
          {
            id: 11,
            copy: 'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
          },
        ],
      },
    ],
  },
};

module.exports = deal;

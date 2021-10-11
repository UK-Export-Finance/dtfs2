const now = new Date();
const nowPlusMonth = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};
const nowMinusDay = () => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date;
};

const deal = {
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    status: 'Ready for Checker\'s approval',
    dateOfLastAction: '1985/11/04 21:00:00:000',
    previousStatus: 'Draft',
  },
  comments: [{
    username: 'bananaman',
    timestamp: '1984/12/25 00:00:00:001',
    text: 'Merry Christmas from the 80s',
  }, {
    username: 'supergran',
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Also Merry Christmas from the 80s',
  }],
  mockFacilities: [
    {
      facilityType: 'bond',
      bondIssuer: 'my issuer',
      bondType: 'Retention bond',
      facilityStage: 'Issued',
      ukefGuaranteeInMonths: '12',
      'requestedCoverStartDate-day': now.getDate(),
      'requestedCoverStartDate-month': now.getMonth() + 1,
      'requestedCoverStartDate-year': now.getFullYear(),
      'coverEndDate-day': nowPlusMonth.getDate(),
      'coverEndDate-month': nowPlusMonth.getMonth() + 1,
      'coverEndDate-year': nowPlusMonth.getFullYear(),
      uniqueIdentificationNumber: '1234567890',
      bondBeneficiary: 'test',
      facilityValue: '1234',
      currencySameAsSupplyContractCurrency: 'false',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
      conversionRate: '100',
      'conversionRateDate-day': `${now.subtract(1, 'day').format('DD')}`,
      'conversionRateDate-month': `${now.subtract(1, 'day').format('MM')}`,
      'conversionRateDate-year': `${now.subtract(1, 'day').format('YYYY')}`,
      riskMarginFee: '12',
      coveredPercentage: '24',
      minimumRiskMarginFee: '1',
      feeType: 'In advance',
      feeFrequency: 'Quarterly',
      dayCountBasis: '360',
      guaranteeFeePayableByBank: '12.345',
      ukefExposure: '1,234.56',
    },
    {
      facilityType: 'bond',
      bondIssuer: 'my issuer',
      bondType: 'Retention bond',
      facilityStage: 'Issued',
      ukefGuaranteeInMonths: '12',
      'requestedCoverStartDate-day': now.getDate(),
      'requestedCoverStartDate-month': now.getMonth() + 1,
      'requestedCoverStartDate-year': now.getFullYear(),
      'coverEndDate-day': nowPlusMonth.getDate(),
      'coverEndDate-month': nowPlusMonth.getMonth() + 1,
      'coverEndDate-year': nowPlusMonth.getFullYear(),
      uniqueIdentificationNumber: '1234567890',
      bondBeneficiary: 'test',
      facilityValue: '5678',
      currencySameAsSupplyContractCurrency: 'true',
      currency: {
        text: 'CAD - Canadian Dollars',
        id: 'CAD',
      },
      riskMarginFee: '12',
      coveredPercentage: '24',
      minimumRiskMarginFee: '1',
      feeType: 'In arrear',
      feeFrequency: 'Monthly',
      dayCountBasis: '360',
      guaranteeFeePayableByBank: '12.345',
      ukefExposure: '1,234.56',
    },
    {
      facilityType: 'loan',
      facilityStage: 'Conditional',
      ukefGuaranteeInMonths: '12',
      bankReferenceNumber: '123456',
      guaranteeFeePayableByBank: '10.8000',
      ukefExposure: '2,469,135.60',
      facilityValue: '12345678',
      currencySameAsSupplyContractCurrency: 'true',
      interestMarginFee: '12',
      coveredPercentage: '20',
      minimumQuarterlyFee: '20',
      premiumFrequency: 'Monthly',
      premiumType: 'In advance',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
    },
    {
      facilityType: 'loan',
      facilityStage: 'Unconditional',
      'requestedCoverStartDate-day': now.getDate(),
      'requestedCoverStartDate-month': now.getMonth() + 1,
      'requestedCoverStartDate-year': now.getFullYear(),
      'coverEndDate-day': nowPlusMonth.getDate(),
      'coverEndDate-month': nowPlusMonth.getMonth() + 1,
      'coverEndDate-year': nowPlusMonth.getFullYear(),
      bankReferenceNumber: '12345678',
      guaranteeFeePayableByBank: '10.8000',
      ukefExposure: '3,703,703.40',
      facilityValue: '12345678',
      currencySameAsSupplyContractCurrency: 'false',
      currency: {
        text: 'AUD - Australian Dollars',
        id: 'AUD',
      },
      conversionRate: '80',
      'conversionRateDate-day': nowMinusDay.getDate(),
      'conversionRateDate-month': nowMinusDay.getMonth() + 1,
      'conversionRateDate-year': nowMinusDay.getFullYear(),
      disbursementAmount: '10',
      interestMarginFee: '12',
      coveredPercentage: '30',
      minimumQuarterlyFee: '123456',
      premiumFrequency: 'Quarterly',
      premiumType: 'In advance',
      dayCountBasis: '365',
    },
  ],
  eligibility: {
    criteria: [
      {
        id: 11,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 12,
        description: 'The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.',
        answer: true,
      },
      {
        id: 13,
        description: 'The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).',
        answer: true,
      },
      {
        id: 14,
        description: 'For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.',
        answer: true,
      },
      {
        id: 15,
        description: 'The Requested Cover Start Date is no more than three months from the date of submission.',
        answer: true,
      },
      {
        id: 16,
        description: 'The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.',
        answer: true,
      },
      {
        id: 17,
        description: 'The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.',
        answer: true,
      },
      {
        id: 18,
        description: 'The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.',
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
    'indemnifier-address-line-1': '27a',
    'indemnifier-address-line-2': 'Maxwell Road',
    'indemnifier-address-postcode': 'HA6 2XY',
    'indemnifier-address-town': 'Northwood',
    'indemnifier-companies-house-registration-number': '08547313',
    'indemnifier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-correspondence-address-line-3': 'Essex',
    'indemnifier-correspondence-address-line-1': '27 Petersfield',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-postcode': 'CM1 4EP',
    'indemnifier-correspondence-address-town': 'Chelmsford',
    'indemnifier-name': 'WATKINSON TRADING LIMITED',
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
    'supplier-address-postcode': 'SW1A 2HQ',
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
    'supplier-name': 'UKFS',
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
    'buyer-name': 'Huggy Bear',
    destinationOfGoodsAndServices: {
      name: 'United States',
      code: 'USA',
    },
    viewedPreviewPage: true,
    supplyContractConversionRateToGBP: '1.123456',
    supplyContractCurrency: {
      id: 'USD',
    },
    supplyContractValue: '10,000',
    'supplyContractConversionDate-day': nowMinusDay.getDate(),
    'supplyContractConversionDate-month': nowMinusDay.getMonth() + 1,
    'supplyContractConversionDate-year': nowMinusDay.getFullYear(),
  },
  summary: {
    totalValue: {
      dealInDealCurrency: '10,000',
      dealInGbp: '12,000',
      bondInDealCurrency: '8,000',
      bondInGbp: '16,000',
      loanInDealCurrency: '4,000',
      loanInGbp: '8,000',
    },
  },
  mandatoryCriteria: [
    {
      id: '1',
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
      id: '2',
      title: 'Financial',
      items: [
        {
          id: 4,
          copy: 'The Bank Customer (to include both the Supplier and any Parent Obligor) is an <a href="/financial_difficulty_model_1.1.0.xlsx" class="govuk-link">Eligible Person spreadsheet</a>',
        },
      ],
    },
    {
      id: '3',
      title: 'Credit',
      items: [
        {
          id: 5,
          copy: 'The Bank Customer (to include both the Supplier and any UK Parent Obligor) has a one- year probability of default of less than 14.1%.',
        },
      ],
    },
    {
      id: '4',
      title: 'Bank Facility Letter',
      items: [
        {
          id: 6,
          copy: 'The Bank Facility Letter is governed by the laws of England and Wales, Scotland or Northern Ireland.',
        },
      ],
    },
    {
      id: '5',
      title: 'Legal',
      items: [
        {
          id: 7,
          copy: 'The Bank is the sole and beneficial owner of, and has legal title to, the Transaction.',
        },
        {
          id: 8,
          copy: 'The Bank has not made a Disposal (other than a Permitted Disposal) or a Risk Transfer (other than a Permitted Risk Transfer) in relation to the Transaction.',
        },
        {
          id: 9,
          copy: 'The Bank’s right, title and interest in relation to the Transaction is clear of any Security and Quasi-Security (other than Permitted Security) and is freely assignable without the need to obtain consent of any Obligor or any other person.',
        },
        {
          id: 10,
          copy: 'The Bank is not restricted or prevented by any agreement with an Obligor from providing information and records relating to the Transaction.',
        },
      ],
    },
  ],
  dealFiles: {
    /*
    exporterQuestionnaire: [
      {
        type: 'general_correspondence',
        fullPath: '1000256/exporterQuestionnaire/test-file-1.txt',
        filename: 'test-file-1.txt',
        url: 'https://dtfsmediaserver.file.core.windows.net/ukef/1000256/exporterQuestionnaire/test-file-1.txt',
      },
      {
        type: 'general_correspondence',
        fullPath: '1000256/exporterQuestionnaire/test-file-2.txt',
        filename: 'test-file-2.txt',
        url: 'https://dtfsmediaserver.file.core.windows.net/ukef/1000256/exporterQuestionnaire/test-file-2.txt',
      },
    ],
    auditedFinancialStatements: [
      {
        type: 'financials',
        fullPath: '1000256/exporterQuestionnaire/test-file-3.txt',
        filename: 'test-file-3.txt',
        url: 'https://dtfsmediaserver.file.core.windows.net/ukef/1000256/exporterQuestionnaire/test-file-3.txt',
      },
    ],
    security: 'security test',
    */
  },
};

module.exports = deal;

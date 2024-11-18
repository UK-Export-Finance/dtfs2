const { CURRENCY } = require('@ukef/dtfs2-common');
const { MOCK_PORTAL_USERS } = require('./mock-portal-users');
const MOCK_FACILITIES_USD_CURRENCY = require('./mock-facilities-USD-currency');

const MOCK_DEAL = {
  _id: '123',
  dealType: 'BSS/EWCS',
  submissionType: 'Automatic Inclusion Notice',
  bankInternalRefName: 'Mock supply contract ID',
  additionalRefName: 'Mock supply contract name',
  status: 'Acknowledged',
  previousStatus: 'Submitted',
  bank: {
    id: '123',
    name: 'Barclays Bank',
    emails: ['test1@mock.com', 'test2@mock.com'],
  },
  maker: MOCK_PORTAL_USERS[0],
  details: {
    bank: 'Mock bank',
    ukefDealId: '20010739',
    checker: {
      username: 'CHECKER',
      firstname: 'Emilio',
      surname: 'Largo',
    },
    submissionDate: '1606900616651',
    submissionCount: 1,
  },
  submissionDetails: {
    status: 'Incomplete',
    'indemnifier-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-address-line-1': 'Addr 1',
    'indemnifier-address-line-2': 'Addr 2',
    'indemnifier-address-line-3': 'Addr 3',
    'indemnifier-address-postcode': 'test',
    'indemnifier-address-town': 'test town',
    'indemnifier-companies-house-registration-number': '12345678',
    'indemnifier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'indemnifier-correspondence-address-line-1': 'Addr 1',
    'indemnifier-correspondence-address-line-2': 'Addr 2',
    'indemnifier-correspondence-address-line-3': 'Addr 3',
    'indemnifier-correspondence-address-postcode': 'test',
    'indemnifier-correspondence-address-town': 'test town',
    'indemnifier-name': 'Mock name',
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
    'supplier-companies-house-registration-number': '12345678',
    'supplier-correspondence-address-country': {
      code: 'GBR',
      name: 'United Kingdom',
    },
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-line-1': 'Addr 1',
    'supplier-correspondence-address-line-2': 'Addr 2',
    'supplier-correspondence-address-line-3': 'Addr 3',
    'supplier-correspondence-address-postcode': 'test',
    'supplier-correspondence-address-town': 'test town',
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
  eligibility: {
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
        answer: false,
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
    agentAddressCountry: {
      code: 'GBR',
      name: 'United Kingdom',
    },
    agentName: 'AGENT NAME',
    agentAddressPostcode: 'CF64 5SH',
    agentAddressTown: 'City',
  },
  facilities: [MOCK_FACILITIES_USD_CURRENCY[0]._id, MOCK_FACILITIES_USD_CURRENCY[1]._id],
  bondTransactions: {
    items: [{ ...MOCK_FACILITIES_USD_CURRENCY[0] }],
  },
  loanTransactions: {
    items: [{ ...MOCK_FACILITIES_USD_CURRENCY[1] }],
  },
  exporter: {
    companyName: 'test',
  },
};

module.exports = MOCK_DEAL;

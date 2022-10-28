const MANDATORY_CRITERIA = require('../mandatoryCriteria');
const ELIGIBILITY_CRITERIA = require('../eligibilityCriteria');
const BANKS = require('../../banks');
const USERS = require('../../portal/users');

// de-structure and create a new array, so `sort` doesn't impact 'MANDATORY_CRITERIA'
let mandatoryCriteria = [...MANDATORY_CRITERIA].sort((a, b) => (a.version > b.version ? 1 : -1));
// get the latest mandatory criteria (sorted by version)
mandatoryCriteria = mandatoryCriteria[mandatoryCriteria.length - 1];

// de-structure and create a new array, so `sort` doesn't impact 'ELIGIBILITY_CRITERIA'
let eligibility = [...ELIGIBILITY_CRITERIA].sort((a, b) => (a.version > b.version ? 1 : -1));
// get the latest eligibility criteria (sorted by version)
eligibility = eligibility[eligibility.length - 1];

const bank = BANKS.filter(({ id }) => id === '9');
const maker = USERS.filter(({ username }) => username === 'BANK1_MAKER2');

module.exports = {
  dealType: 'BSS/EWCS',
  submissionType: 'Automatic Inclusion Notice',
  updatedAt: Date.now(),
  bank,
  details: {
    status: 'Draft',
    maker,
    created: Date.now(),
  },
  eligibility,
  mandatoryCriteria,
  submissionDetails: {
    status: 'Incomplete',
    'supplier-type': 'Exporter',
    'supplier-companies-house-registration-number': 'TEST',
    'supplier-name': 'Auto Test 1',
    'supplier-address-country': {
      name: 'Australia',
      code: 'AUS',
    },
    'supplier-address-line-1': 'TEST',
    'supplier-address-line-2': 'TEST',
    'supplier-address-line-3': 'TEST',
    'supplier-address-town': 'TEST',
    'supplier-address-postcode': 'TEST',
    'supplier-correspondence-address-is-different': 'false',
    'supplier-correspondence-address-country': {},
    'supplier-correspondence-address-line-1': '',
    'supplier-correspondence-address-line-2': '',
    'supplier-correspondence-address-line-3': '',
    'supplier-correspondence-address-town': '',
    'supplier-correspondence-address-postcode': '',
    'industry-sector': {
      code: '1005',
      name: 'Construction',
    },
    'industry-class': {
      code: '42910',
      name: 'Construction of water projects',
    },
    'sme-type': 'Medium',
    'supply-contract-description': 'TEST',
    legallyDistinct: 'false',
    'indemnifier-companies-house-registration-number': '',
    'indemnifier-name': '',
    'indemnifier-address-country': {},
    'indemnifier-address-line-1': '',
    'indemnifier-address-line-2': '',
    'indemnifier-address-line-3': '',
    'indemnifier-address-town': '',
    'indemnifier-address-postcode': '',
    'indemnifier-correspondence-address-country': {},
    'indemnifier-correspondence-address-line-1': '',
    'indemnifier-correspondence-address-line-2': '',
    'indemnifier-correspondence-address-line-3': '',
    'indemnifier-correspondence-address-town': '',
    'indemnifier-correspondence-address-postcode': '',
    indemnifierCorrespondenceAddressDifferent: '',
    'buyer-name': 'A1 Test',
    'buyer-address-country': {
      name: 'United Kingdom',
      code: 'GBR',
    },
    'buyer-address-line-1': 'TEST',
    'buyer-address-line-2': 'TEST',
    'buyer-address-line-3': 'TEST',
    'buyer-address-town': 'TEST',
    'buyer-address-postcode': 'TEST',
    destinationOfGoodsAndServices: {
      name: 'United Arab Emirates',
      code: 'ARE',
    },
    supplyContractValue: '5000000.00',
    supplyContractCurrency: {
      text: 'GBP - UK Sterling',
      id: 'GBP',
      currencyId: 12,
    },
    supplyContractConversionRateToGBP: '',
    'supplyContractConversionDate-day': '',
    'supplyContractConversionDate-month': '',
    'supplyContractConversionDate-year': '',
  },

};

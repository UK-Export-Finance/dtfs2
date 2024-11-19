const MOCK_DEAL = require('./mock-deal');

const MOCK_DEAL_NO_UKEF_ID = require('./mock-deal-no-ukef-id');
const MOCK_DEAL_NO_PARTY_DB = require('./mock-deal-no-party-db');
const MOCK_DEAL_NO_COMPANIES_HOUSE = require('./mock-deal-no-companies-house');
const MOCK_DEAL_FACILITIES_USD_CURRENCY = require('./mock-deal-facilities-USD-currency');
const MOCK_DEAL_ISSUED_FACILITIES = require('./mock-deal-issued-facilities');
const MOCK_DEAL_MIN = require('./mock-deal-MIN');
const MOCK_DEAL_MIA_SUBMITTED = require('./mock-deal-MIA-submitted');
const MOCK_DEAL_MIA_NOT_SUBMITTED = require('./mock-deal-MIA-not-submitted');
const MOCK_DEAL_AIN_SUBMITTED = require('./mock-deal-AIN-submitted');
const MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE = require('./mock-deal-AIN-submitted-non-gbp-contract-value');
const MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-AIN-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-MIA-second-submit-facilities-unissued-to-issued');
const MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED = require('./mock-deal-MIN-second-submit-facilities-unissued-to-issued');
const MOCK_MIA_SUBMITTED = require('./mock-deal-MIA-submitted');
const MOCK_MIA_SECOND_SUBMIT = require('./mock-deal-MIA-second-submit');

const MOCK_GEF_DEAL = require('./mock-gef-deal');
const MOCK_GEF_DEAL_MIA = require('./mock-gef-deal-MIA');
const MOCK_GEF_DEAL_SECOND_SUBMIT_MIA = require('./mock-gef-deal-second-submit-MIA');
const MOCK_GEF_DEAL_MIN = require('./mock-gef-deal-MIN');

const ALL_MOCK_DEALS = [
  MOCK_DEAL,
  MOCK_DEAL_NO_UKEF_ID,
  MOCK_DEAL_NO_PARTY_DB,
  MOCK_DEAL_NO_COMPANIES_HOUSE,
  MOCK_DEAL_FACILITIES_USD_CURRENCY,
  MOCK_DEAL_ISSUED_FACILITIES,
  MOCK_DEAL_MIN,
  MOCK_DEAL_MIA_SUBMITTED,
  MOCK_DEAL_MIA_NOT_SUBMITTED,
  MOCK_DEAL_AIN_SUBMITTED,
  MOCK_DEAL_AIN_SUBMITTED_NON_GBP_CONTRACT_VALUE,
  MOCK_DEAL_AIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_DEAL_MIA_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_DEAL_MIN_SECOND_SUBMIT_FACILITIES_UNISSUED_TO_ISSUED,
  MOCK_MIA_SUBMITTED,
  MOCK_GEF_DEAL_SECOND_SUBMIT_MIA,
  MOCK_MIA_SECOND_SUBMIT,
  MOCK_GEF_DEAL,
  MOCK_GEF_DEAL_MIA,
  MOCK_GEF_DEAL_MIN,
];

module.exports = ALL_MOCK_DEALS;

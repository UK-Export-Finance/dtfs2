const dotenv = require('dotenv');
const path = require('path');
const nunjucks = require('nunjucks');
let mojFilters = require('@ministryofjustice/frontend/moj/filters/all')();
const { localiseTimestamp } = require('./filter-localiseTimestamp');
const { formatDateString } = require('./filter-formatDateString');
const { formatIsoDateString } = require('./filter-formatIsoDateString');
const dashIfEmpty = require('./filter-dashIfEmpty');
const formatBooleanAsString = require('./filter-formatOptionalBooleanAsString');
const displayName = require('./filter-displayName');
const formatAsCurrency = require('./filter-formatAsCurrency');
const countriesWithEmptyInitialOption = require('./filter-countriesWithEmptyInitialOption');
const replaceWhiteSpaceWithDash = require('./filter-replaceWhiteSpaceWithDash');
const bondBeneficiaryFacilities = require('./filter-bondBeneficiaryFacilities');
const bondIssuerFacilities = require('./filter-bondIssuerFacilities');
const formatAsDecimal = require('./filter-formatAsDecimal');
const sentenceCase = require('./filter-sentenceCase');
const { userIsInTeam, userIsOnlyInTeams } = require('../helpers/user');

dotenv.config();

/**
 *
 * @param {nunjucks.ConfigureOptions} opts - The configuration options
 * @returns {nunjucks.Environment}
 */
const configureNunjucks = (opts) => {
  const { CONTACT_US_SELF_SERVICE_PORTAL_URL, CONTACT_US_EMAIL_ADDRESS } = process.env;

  const appViews = [
    path.resolve(__dirname, '../../../node_modules/govuk-frontend'),
    path.resolve(__dirname, '../../../node_modules/@ministryofjustice/frontend'),
    path.resolve(__dirname, '../../../node_modules/@ministryofjustice/frontend/filters/all'),
    path.resolve(__dirname, '../../templates'),
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addGlobal('CONTACT_US_SELF_SERVICE_PORTAL_URL', CONTACT_US_SELF_SERVICE_PORTAL_URL);
  nunjucksEnvironment.addGlobal('CONTACT_US_EMAIL_ADDRESS', CONTACT_US_EMAIL_ADDRESS);

  nunjucksEnvironment.addFilter('localiseTimestamp', localiseTimestamp);
  nunjucksEnvironment.addFilter('formatDateString', formatDateString);
  nunjucksEnvironment.addFilter('formatIsoDateString', formatIsoDateString);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('formatBooleanAsString', formatBooleanAsString);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);
  nunjucksEnvironment.addFilter('bondBeneficiaryFacilities', bondBeneficiaryFacilities);
  nunjucksEnvironment.addFilter('bondIssuerFacilities', bondIssuerFacilities);
  nunjucksEnvironment.addFilter('formatAsDecimal', formatAsDecimal);
  nunjucksEnvironment.addFilter('sentence', sentenceCase);
  nunjucksEnvironment.addFilter('userIsInTeam', (user, teamIdList) => userIsInTeam(user, teamIdList));
  nunjucksEnvironment.addFilter('userIsOnlyInTeams', (user, teamIdList) => userIsOnlyInTeams(user, teamIdList));

  mojFilters = Object.assign(mojFilters);
  Object.keys(mojFilters).forEach((filterName) => {
    nunjucksEnvironment.addFilter(filterName, mojFilters[filterName]);
  });

  return nunjucks;
};

module.exports = configureNunjucks;

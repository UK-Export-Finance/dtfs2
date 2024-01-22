const nunjucks = require('nunjucks');
let mojFilters = require('../../node_modules/@ministryofjustice/frontend/moj/filters/all')();
const filterLocaliseTimestamp = require('./filter-localiseTimestamp');
const filterFormatDateString = require('./filter-formatDateString');
const dashIfEmpty = require('./filter-dashIfEmpty');
const displayName = require('./filter-displayName');
const formatAsCurrency = require('./filter-formatAsCurrency');
const countriesWithEmptyInitialOption = require('./filter-countriesWithEmptyInitialOption');
const replaceWhiteSpaceWithDash = require('./filter-replaceWhiteSpaceWithDash');
const bondBeneficiaryFacilities = require('./filter-bondBeneficiaryFacilities');
const bondIssuerFacilities = require('./filter-bondIssuerFacilities');
const formatAsDecimal = require('./filter-formatAsDecimal');
const sentenceCase = require('./filter-sentenceCase');
const { userIsInTeam, userIsOnlyInTeam } = require('../helpers/user');

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
    'node_modules/@ministryofjustice/frontend/filters/all',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('formatDateString', filterFormatDateString);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);
  nunjucksEnvironment.addFilter('bondBeneficiaryFacilities', bondBeneficiaryFacilities);
  nunjucksEnvironment.addFilter('bondIssuerFacilities', bondIssuerFacilities);
  nunjucksEnvironment.addFilter('formatAsDecimal', formatAsDecimal);
  nunjucksEnvironment.addFilter('sentence', sentenceCase);
  nunjucksEnvironment.addFilter('userIsInTeam', (user, teamIdList) => userIsInTeam(user, teamIdList));
  nunjucksEnvironment.addFilter('userIsOnlyInTeam', (user, teamIdList) => userIsOnlyInTeam(user, teamIdList));

  mojFilters = Object.assign(mojFilters);
  Object.keys(mojFilters).forEach((filterName) => {
    nunjucksEnvironment.addFilter(filterName, mojFilters[filterName]);
  });

  return nunjucks;
};

module.exports = configureNunjucks;

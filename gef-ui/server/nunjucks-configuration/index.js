const nunjucks = require('nunjucks');
const filterLocaliseTimestamp = require('./filter-localiseTimestamp');
const dashIfEmpty = require('./filter-dashIfEmpty');
const displayName = require('./filter-displayName');
const formatAsCurrency = require('./formatAsCurrency');
const countriesWithEmptyInitialOption = require('./filter-countriesWithEmptyInitialOption');
const replaceWhiteSpaceWithDash = require('./filter-replaceWhiteSpaceWithDash');
const getStatusLabel = require('./filter-getStatusLabel');
let mojFilters = require('../../node_modules/@ministryofjustice/frontend/moj/filters/all')();

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
    'node_modules/@ministryofjustice/frontend/filters/all',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);
  nunjucksEnvironment.addFilter('getStatusLabel', getStatusLabel);
  mojFilters = Object.assign(mojFilters);
  Object.keys(mojFilters).forEach((filterName) => {
    nunjucksEnvironment.addFilter(filterName, mojFilters[filterName]);
  });
  return nunjucks;
};

module.exports = configureNunjucks;

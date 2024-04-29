const path = require('path');
const nunjucks = require('nunjucks');
let mojFilters = require('@ministryofjustice/frontend/moj/filters/all')();
const { filterLocaliseTimestamp } = require('./filter-localiseTimestamp');
const dashIfEmpty = require('./filter-dashIfEmpty');
const displayName = require('./filter-displayName');
const formatAsCurrency = require('./formatAsCurrency');
const countriesWithEmptyInitialOption = require('./filter-countriesWithEmptyInitialOption');
const replaceWhiteSpaceWithDash = require('./filter-replaceWhiteSpaceWithDash');
require('dotenv').config();

const configureNunjucks = (opts) => {
  const appViews = [
    path.resolve(__dirname, '../../../node_modules/govuk-frontend'),
    path.resolve(__dirname, '../../../node_modules/@ministryofjustice/frontend'),
    path.resolve(__dirname, '../../../node_modules/@ministryofjustice/frontend/filters/all'),
    path.resolve(__dirname, '../../templates'),
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addGlobal(
    'CONTACT_US_EMAIL_ADDRESS',
    process.env.CONTACT_US_EMAIL_ADDRESS || 'DigitalService.TradeFinance@ukexportfinance.gov.uk',
  );

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);

  mojFilters = Object.assign(mojFilters);

  Object.keys(mojFilters).forEach((filterName) => {
    nunjucksEnvironment.addFilter(filterName, mojFilters[filterName]);
  });

  return nunjucks;
};

module.exports = configureNunjucks;

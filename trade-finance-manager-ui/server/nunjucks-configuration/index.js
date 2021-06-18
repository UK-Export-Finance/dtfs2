import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';
import formatDate from './formatDate';
import filterFormatDateString from './filter-formatDateString';
import dashIfEmpty from './filter-dashIfEmpty';
import displayName from './filter-displayName';
import formatAsCurrency from './formatAsCurrency';
import countriesWithEmptyInitialOption from './filter-countriesWithEmptyInitialOption';
import replaceWhiteSpaceWithDash from './filter-replaceWhiteSpaceWithDash';
import bondBeneficiaryFacilities from './filter-bondBeneficiaryFacilities';
import bondIssuerFacilities from './filter-bondIssuerFacilities';
import formatAsDecimal from './formatAsDecimal';

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('formatDateString', filterFormatDateString);
  nunjucksEnvironment.addFilter('formatDate', formatDate);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);
  nunjucksEnvironment.addFilter('bondBeneficiaryFacilities', bondBeneficiaryFacilities);
  nunjucksEnvironment.addFilter('bondIssuerFacilities', bondIssuerFacilities);
  nunjucksEnvironment.addFilter('formatAsDecimal', formatAsDecimal);


  return nunjucks;
};

export default configureNunjucks;

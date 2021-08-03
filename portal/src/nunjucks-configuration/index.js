import path from 'path';
import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';
import dashIfEmpty from './filter-dashIfEmpty';
import displayName from './filter-displayName';
import formatAsCurrency from './formatAsCurrency';
import countriesWithEmptyInitialOption from './filter-countriesWithEmptyInitialOption';
import replaceWhiteSpaceWithDash from './filter-replaceWhiteSpaceWithDash';
import getStatusLabel from './filter-getStatusLabel';


const configureNunjucks = (opts) => {
  const appViews = [
    path.join(__dirname, '..', '..', 'node_modules/govuk-frontend'),
    path.join(__dirname, '..', '..', 'node_modules/@ministryofjustice/frontend'),
    path.join(__dirname, '..', 'templates'),
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  nunjucksEnvironment.addFilter('countriesWithEmptyInitialOption', countriesWithEmptyInitialOption);
  nunjucksEnvironment.addFilter('replaceWhiteSpaceWithDash', replaceWhiteSpaceWithDash);
  nunjucksEnvironment.addFilter('getStatusLabel', getStatusLabel);
  return nunjucks;
};

export default configureNunjucks;

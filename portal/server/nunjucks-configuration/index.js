import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';
import dashIfEmpty from './filter-dashIfEmpty';
import displayName from './filter-displayName';
import formatAsCurrency from './formatAsCurrency';

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  nunjucksEnvironment.addFilter('displayName', displayName);
  nunjucksEnvironment.addFilter('formatAsCurrency', formatAsCurrency);
  return nunjucks;
};

export default configureNunjucks;

import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';
import dashIfEmpty from './filter-dashIfEmpty';

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'node_modules/@ministryofjustice/frontend',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
  nunjucksEnvironment.addFilter('dashIfEmpty', dashIfEmpty);
  return nunjucks;
};

export default configureNunjucks;

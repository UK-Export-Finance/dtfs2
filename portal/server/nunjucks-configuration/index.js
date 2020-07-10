import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';

const configureNunjucks = (opts) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, opts);

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);

  return nunjucks;
};

export default configureNunjucks;

import nunjucks from 'nunjucks';
import filterLocaliseTimestamp from './filter-localiseTimestamp';

const configureNunjucks = (app) => {
  const appViews = [
    'node_modules/govuk-frontend',
    'templates',
  ];

  const nunjucksEnvironment = nunjucks.configure(appViews, {
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

  nunjucksEnvironment.addFilter('localiseTimestamp', filterLocaliseTimestamp);
};

export default configureNunjucks;

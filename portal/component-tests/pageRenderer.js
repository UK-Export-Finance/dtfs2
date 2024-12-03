/* eslint-disable import/no-import-module-exports */
import cheerio from 'cheerio';

import assertions from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const pageRenderer = (pageLocation) => (params) => {
  const nunjucks = configureNunjucks({});
  const html = nunjucks.render(pageLocation, params);
  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

module.exports = pageRenderer;

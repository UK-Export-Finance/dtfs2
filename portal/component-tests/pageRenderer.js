import cheerio from 'cheerio';

import assertions from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({});

const pageRenderer = (pageLocation) => (params) => {
  const html = nunjucks.render(pageLocation, params);
  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

module.exports = pageRenderer;

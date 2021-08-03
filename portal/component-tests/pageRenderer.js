// eslint-disable-next-line import/no-extraneous-dependencies
import cheerio from 'cheerio';

import assertions from './assertions';
import configureNunjucks from '../src/nunjucks-configuration';

const nunjucks = configureNunjucks({});

const pageRenderer = (pageLocation) => (params) => {
  const html = nunjucks.render(pageLocation, params);
  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

module.exports = pageRenderer;

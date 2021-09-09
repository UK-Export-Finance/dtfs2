const cheerio = require('cheerio');

const assertions = require('./assertions');
const configureNunjucks = require('../server/nunjucks-configuration');

const nunjucks = configureNunjucks({});

const pageRenderer = (pageLocation) => (params) => {
  const html = nunjucks.render(pageLocation, params);
  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

module.exports = pageRenderer;

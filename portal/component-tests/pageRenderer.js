const nunjucks = require('nunjucks');
const cheerio = require('cheerio');
const assertions = require('./assertions');

nunjucks.configure([
  'node_modules/govuk-frontend',
  'templates',
]);

const pageRenderer = (pageLocation) => {
  return (params) => {

    const html = nunjucks.render(pageLocation, params);
    const wrapper = cheerio.load(html);
    return assertions(wrapper, html, params);
  }
}

module.exports = pageRenderer;

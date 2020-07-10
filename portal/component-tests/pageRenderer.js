const assertions = require('./assertions');
const cheerio = require('cheerio');
const configureNunjucks = require('../server/nunjucks-configuration').default;

const nunjucks = configureNunjucks({});

const pageRenderer = (pageLocation) => {
  return (params) => {

    const html = nunjucks.render(pageLocation, params);
    const wrapper = cheerio.load(html);
    return assertions(wrapper, html, params);
  }
}

module.exports = pageRenderer;

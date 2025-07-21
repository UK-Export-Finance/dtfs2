const cheerio = require('cheerio');

const assertions = require('./assertions');
const configureNunjucks = require('../server/nunjucks-configuration');

/**
 * Renders a Nunjucks template at the specified page location with given parameters,
 * loads the resulting HTML into Cheerio, and performs assertions.
 *
 * @param {string} pageLocation - The path to the Nunjucks template file to render.
 * @returns {function(Object): any} - A function that takes template parameters,
 *   renders the template, loads it into Cheerio, and returns the result of assertions.
 */
const pageRenderer = (pageLocation) => (params) => {
  const nunjucks = configureNunjucks({});
  const html = nunjucks.render(pageLocation, params);
  const wrapper = cheerio.load(html);

  return assertions(wrapper, html, params);
};

module.exports = pageRenderer;

const cheerio = require('cheerio');

const assertions = require('./assertions');
const configureNunjucks = require('../server/nunjucks-configuration');

const nunjucks = configureNunjucks({});

/**
 *
 * @param {string} componentLocation
 * @param {any} params
 * @returns {import("./assertionsWrapper.types").AssertionsWrapper}
 */
const render = (componentLocation, params) => {
  const fakePage = `
    {% import '${componentLocation}' as componentUnderTest %}
    <div>
      {{ componentUnderTest.render(payload) }}
    </div>
    `;

  const html = nunjucks.renderString(fakePage, { payload: params });
  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

/**
 * @param {string} componentLocation
 */
const componentRenderer = (componentLocation) => (params) => render(componentLocation, params);

module.exports = componentRenderer;

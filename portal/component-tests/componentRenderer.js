const { load } = require('cheerio');
const assertions = require('./assertions');
const configureNunjucks = require('../server/nunjucks-configuration');

/**
 * Renders a component and performs assertions on the rendered HTML.
 * @param {string} componentLocation - The location of the component to be imported and rendered.
 * @returns {function} - A function that takes `params` as input and performs the rendering and assertions.
 */
const componentRenderer = (componentLocation) => (params) => {
  const nunjucks = configureNunjucks({});
  // Create a template string for the fake HTML page
  const fakePage = `
    {% import '${componentLocation}' as componentUnderTest %}
    <div>
      {{ componentUnderTest.render(payload) }}
    </div>
  `;

  // Render the fake page using Nunjucks
  const html = nunjucks.renderString(fakePage, { payload: params });

  // Load the rendered HTML into Cheerio
  const $ = load(html);

  // Perform assertions on the rendered HTML
  return assertions($, html, params);
};

module.exports = componentRenderer;

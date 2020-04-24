const nunjucks = require('nunjucks');
const cheerio = require('cheerio');
const assertions = require('./assertions');

nunjucks.configure([
  'node_modules/govuk-frontend',
  'templates',
]);


const componentRenderer = (componentLocation) => {
  return (params) => {

    const fakePage = `
    {% import '${componentLocation}' as componentUnderTest %}
    <div>
      {{ componentUnderTest.render(payload) }}
    </div>
    `;

    const html = nunjucks.renderString(fakePage, {payload: params});
    const $ = cheerio.load(html);
    return assertions($, html, params);
  }
}

module.exports = componentRenderer;

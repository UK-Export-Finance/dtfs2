const nunjucks = require('nunjucks');
const cheerio = require('cheerio');

nunjucks.configure([
  'node_modules/govuk-frontend',
  'templates',
]);

const component = (componentLocation) => {
  return {
    render: (...args) => {
      const pageVariables = {};

      for (let i = 0; i < args.length; i++) {
        pageVariables[`variable_${i}`] = args[i];
      }

      const variablesToInjectIntoComponent = Object.keys(pageVariables).join(',');
      const fakePage = `
      {% import '${componentLocation}' as componentUnderTest %}
      <div>
        {{ componentUnderTest.render(${variablesToInjectIntoComponent}) }}
      </div>
      `;

      const html = nunjucks.renderString(fakePage, pageVariables);

      return cheerio.load(html);
    }
  }
}

module.exports = component;

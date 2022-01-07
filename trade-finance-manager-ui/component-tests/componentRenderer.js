import cheerio from 'cheerio';

import assertions from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({});

const componentRenderer = (componentLocation, renderTableContainer = false) => (params) => {
  let fakePage;

  if (renderTableContainer) {
    fakePage = `
        {% import '${componentLocation}' as componentUnderTest %}
        <table>
          {{ componentUnderTest.render(payload) }}
        </table>
      `;
  } else {
    fakePage = `
        {% import '${componentLocation}' as componentUnderTest %}
        <div>
          {{ componentUnderTest.render(payload) }}
        </div>
      `;
  }

  const html = nunjucks.renderString(fakePage, { payload: params });

  const wrapper = cheerio.load(html);
  return assertions(wrapper, html, params);
};

module.exports = componentRenderer;

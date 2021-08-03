// eslint-disable-next-line import/no-extraneous-dependencies
import cheerio from 'cheerio';

import assertions from './assertions';
import configureNunjucks from '../src/nunjucks-configuration';

const nunjucks = configureNunjucks({});

const componentRenderer = (componentLocation) => (params) => {
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

module.exports = componentRenderer;

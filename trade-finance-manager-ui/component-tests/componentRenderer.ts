import { load } from 'cheerio';
import { assertions } from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({}) as { renderString: (pageLocation: string, params: object) => string };

export const componentRenderer =
  (componentLocation: string, renderTableContainer = false) =>
  (params: object) => {
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

    const wrapper = load(html);
    return assertions(wrapper, html, params);
  };

import { load } from 'cheerio';
import { assertions } from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({});

export const componentRenderer =
  (componentLocation: string, renderTableContainer = false) =>
  <TParams extends object>(params: TParams) => {
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
    return assertions<TParams>(wrapper, html, params);
  };

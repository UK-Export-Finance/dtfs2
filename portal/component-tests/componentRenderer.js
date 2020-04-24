const nunjucks = require('nunjucks');
const cheerio = require('cheerio');

nunjucks.configure([
  'node_modules/govuk-frontend',
  'templates',
]);

const assertions = ($, html, params) => {
  return {
    expectLink: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toBeDisabled: () => {
          expect($(selector).attr('href') ).toBeUndefined();
          expect($(selector).attr('disabled') ).toEqual('disabled');
        },
        toLinkTo: (href) => {
          expect($(selector).attr('href') ).toEqual(href);
          expect($(selector).attr('disabled') ).toBeUndefined();
        }
      };
    },
    expectText: (selector) => {
      return {
        notToExist: () => {
          expect($(selector).html()).toBeNull();
        },
        toRead: (text) => {
          expect($(selector).text()).toEqual(text);
        },
      }
    }
  };
}

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

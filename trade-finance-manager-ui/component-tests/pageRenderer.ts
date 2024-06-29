import { load } from 'cheerio';
import { assertions } from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({}) as { render: (pageLocation: string, params: object) => string };

export const pageRenderer = (pageLocation: string) => (params: object) => {
  const html = nunjucks.render(pageLocation, params);
  const wrapper = load(html);
  return assertions(wrapper, html, params);
};

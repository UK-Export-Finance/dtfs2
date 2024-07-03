import { load } from 'cheerio';
import { assertions } from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({});

export const pageRenderer = (pageLocation: string) => (params: object) => {
  const html = nunjucks.render(pageLocation, params);
  const wrapper = load(html);
  return assertions(wrapper, html, params);
};

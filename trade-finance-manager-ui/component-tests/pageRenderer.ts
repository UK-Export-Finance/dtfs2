import { load } from 'cheerio';
import { AnyObject } from '@ukef/dtfs2-common';
import { assertions } from './assertions';
import configureNunjucks from '../server/nunjucks-configuration';

const nunjucks = configureNunjucks({});

export const pageRenderer =
  <TParams extends AnyObject>(pageLocation: string) =>
  (params: TParams) => {
    const html = nunjucks.render(pageLocation, params);
    const wrapper = load(html);
    return assertions<TParams>(wrapper, html, params);
  };

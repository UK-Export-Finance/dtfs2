// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Express } from 'express';
import { NunjucksTemplateName, NunjucksTemplateViewModel } from './view-models';

declare module 'express-serve-static-core' {
  export interface Response {
    /**
     * Extends the base `core.Response.render` function to use a generic for
     * the render locals (see https://www.geeksforgeeks.org/express-js-res-render-function/)
     */
    render<View extends NunjucksTemplateName>(
      view: View,
      viewModel?: NunjucksTemplateViewModel<View>,
      callback?: (err: Error, html: string) => void,
    ): void;
  }
}

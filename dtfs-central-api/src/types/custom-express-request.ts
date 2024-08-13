// TODO: Remove this and refer to `import { CustomExpressRequest } from '@ukef/dtfs2-common';`

import { Request } from 'express';

/**
 * Obtained from the express 'core.ParamsDictionary' type
 */
type RequestParams = Record<string, string>;

/**
 * Obtained from the express 'core.Query' type
 */
interface RequestQuery {
  [key: string]: string | string[] | RequestQuery | RequestQuery[] | undefined;
}

/**
 * Types match generic params of base express {@link Request} type
 */
type CustomExpressRequestOptions = {
  params?: RequestParams;
  resBody?: any;
  reqBody?: any;
  query?: RequestQuery;
};

export type CustomExpressRequest<Options extends CustomExpressRequestOptions> = Request<
  'params' extends keyof Options ? Options['params'] : RequestParams,
  'resBody' extends keyof Options ? Options['resBody'] : any,
  'reqBody' extends keyof Options ? Options['reqBody'] : any,
  'query' extends keyof Options ? Options['query'] : RequestQuery
>;

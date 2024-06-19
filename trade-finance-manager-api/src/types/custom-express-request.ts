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
  /* eslint-disable @typescript-eslint/no-explicit-any */
  resBody?: any;
  reqBody?: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  query?: RequestQuery;
};

export type CustomExpressRequest<Options extends CustomExpressRequestOptions> = Request<
  'params' extends keyof Options ? Options['params'] : RequestParams,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  'resBody' extends keyof Options ? Options['resBody'] : any,
  'reqBody' extends keyof Options ? Options['reqBody'] : any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  'query' extends keyof Options ? Options['query'] : RequestQuery
>;

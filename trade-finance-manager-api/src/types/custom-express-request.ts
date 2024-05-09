import { Request } from 'express';

/**
 * Obtained from the express `core.ParamsDictionary` type
 */
type RequestParams = Record<string, string>;

/**
 * Obtained from the express `core.Query` type
 */
interface RequestQuery {
  [key: string]: string | string[] | RequestQuery | RequestQuery[] | undefined;
}

type CustomExpressRequestOptions = {
  params?: RequestParams;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  resBody?: any;
  reqBody?: any;
  /* eslint-enable @typescript-eslint/no-explicit-any */
  query?: RequestQuery;
};

export type CustomExpressRequest<Options extends CustomExpressRequestOptions> = Request<
  keyof Options extends 'params' ? Options['params'] : RequestParams,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  keyof Options extends 'resBody' ? Options['resBody'] : any,
  keyof Options extends 'reqBody' ? Options['reqBody'] : any,
  /* eslint-enable @typescript-eslint/no-explicit-any */
  keyof Options extends 'query' ? Options['query'] : RequestQuery
>;

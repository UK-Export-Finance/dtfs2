import { Request } from 'express';

/**
 * Obtained from the express `core.ParamsDictionary` type
 */
type RequestParams = Record<string, string>; 

type RequestBody = Record<string, string | number> | string;

/**
 * Obtained from the express `core.Query` type
 */
type RequestQuery = Record<string, string | string[] | undefined>;

type CustomExpressRequestOptions = {
  params?: RequestParams;
  body?: RequestBody;
  query?: RequestQuery;
};

export type CustomExpressRequest<Options extends CustomExpressRequestOptions> = Request<
  keyof Options extends 'params' ? Options['params'] : RequestParams,
  object,
  keyof Options extends 'body' ? Options['body'] : RequestBody,
  keyof Options extends 'query' ? Options['query'] : RequestQuery
>;

import { Request } from 'express';

type RequestParams = Record<string, string>
type RequestBody = Record<string, string | number> | string;
type RequestQuery = Record<string, string>;

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

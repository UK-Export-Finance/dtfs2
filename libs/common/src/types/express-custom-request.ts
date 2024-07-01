import { Request } from 'express';

/**
 * A type representing the parameters of an Express request.
 *
 * This type is obtained from the Express 'core.ParamsDictionary' type.
 * It is a record where keys are parameter names and values are strings.
 */
type RequestParams = Record<string, string>;

/**
 * A type representing the query parameters of an Express request.
 *
 * This interface is obtained from the Express 'core.Query' type.
 * It defines a structure where keys are query parameter names and values can be:
 * - A string
 * - An array of strings
 * - Another nested RequestQuery
 * - An array of nested RequestQuery objects
 * - Or undefined
 */
interface RequestQuery {
  [key: string]: string | string[] | RequestQuery | RequestQuery[] | undefined;
}

/**
 * A type representing the options for customizing the Express request type.
 *
 * This type matches the generic parameters of the base Express {@link Request} type.
 * It includes:
 * - `params`: An optional {@link RequestParams} object for URL parameters.
 * - `resBody`: An optional response body of any type.
 * - `reqBody`: An optional request body of any type.
 * - `query`: An optional {@link RequestQuery} object for query parameters.
 */
type CustomExpressRequestOptions = {
  params?: RequestParams;
  resBody?: any;
  reqBody?: any;
  query?: RequestQuery;
};

/**
 * A custom Express request type that extends the base {@link Request} type.
 *
 * This type uses {@link CustomExpressRequestOptions} to define optional
 * properties for URL parameters, response body, request body, and query parameters.
 * Depending on which options are provided, the respective types are used; otherwise,
 * default types are applied.
 *
 * @template Options - The options for customizing the request type, extends {@link CustomExpressRequestOptions}.
 */
export type CustomExpressRequest<Options extends CustomExpressRequestOptions> = Request<
  'params' extends keyof Options ? Options['params'] : RequestParams,
  'resBody' extends keyof Options ? Options['resBody'] : any,
  'reqBody' extends keyof Options ? Options['reqBody'] : any,
  'query' extends keyof Options ? Options['query'] : RequestQuery
>;

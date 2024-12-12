import { extractPathParameterPlaceholders } from '@ukef/dtfs2-common';

type UrlPathParameters = Record<string, number | string>;

/**
 * Replaces path parameter placeholders in a URL with provided values.
 * @param urlWithParamPlaceholders - The URL containing path parameter placeholders
 * @param paramValues - Object containing values for the path parameters
 * @returns The constructed URL with path parameters replaced
 * @throws Error if any required path parameter is missing or undefined
 */
export const replaceUrlParameterPlaceholders = (urlWithParamPlaceholders: string, paramValues: UrlPathParameters) => {
  const paramNames = extractPathParameterPlaceholders(urlWithParamPlaceholders);

  return paramNames.reduce((url, param) => {
    if (!paramValues[param]) {
      throw new Error(`Missing value for required path parameter: ${param}`);
    }

    return url.replace(`:${param}`, paramValues[param].toString());
  }, urlWithParamPlaceholders);
};

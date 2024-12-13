/**
 * Extracts path parameter placeholders from a URL string.
 * @param urlWithParamPlaceholders - The URL string containing path parameters prefixed with ':'
 * @returns An array of path parameter names with ':' prefix removed
 */
export const extractPathParameterPlaceholders = (urlWithParamPlaceholders: string): string[] =>
  urlWithParamPlaceholders
    .split('/')
    .filter((pathStr) => pathStr.startsWith(':'))
    .map((pathParam) => pathParam.replace(':', ''));

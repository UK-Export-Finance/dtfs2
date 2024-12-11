type FeeRecordCorrectionPathParameters = {
  reportId?: number | string;
  feeRecordId?: number | string;
  userId?: string;
};

/**
 * Constructs a URL for fee record correction by replacing path parameters in
 * the base URL.
 * @param baseUrl - The base URL containing path parameter placeholders
 * @param pathParameters - Object containing values for the path parameters
 * @returns The constructed URL with path parameters replaced
 * @throws Error if any required path parameter is missing or undefined
 */
export const getFeeRecordCorrectionUrl = (baseUrl: string, pathParameters: FeeRecordCorrectionPathParameters) =>
  Object.entries(pathParameters).reduce((url, [name, value]) => {
    if (!value) {
      throw new Error(`Missing required path parameter: ${name}`);
    }

    return url.replace(`:${name}`, value.toString());
  }, baseUrl);

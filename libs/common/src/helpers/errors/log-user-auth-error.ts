/**
 * Logs user authentication errors to the console with a custom message.
 * If certain properties of the error object are missing, it will log default values instead.
 * @param error The error object containing details about the authentication error.
 * @param message A custom message to provide context for the error.
 */
export const logUserAuthError = (error: unknown, message: string) => {
  if (error && typeof error === 'object') {
    let status: unknown = undefined;
    let specificError: unknown = 'Unknown error';

    if ('response' in error && error.response !== null && typeof error.response === 'object') {
      status = 'status' in error.response ? error.response.status : undefined;
      specificError = 'data' in error.response ? (error.response.data ?? 'Unknown error') : 'Unknown error';
    }

    const errorMessage = 'message' in error ? (error.message ?? 'Unknown error') : 'Unknown error';
    const errorCode = 'code' in error ? (error.code ?? 'UNKNOWN') : 'UNKNOWN';

    console.error('%s: %s (status: %s, code: %s) %o', message, errorMessage, status, errorCode, specificError);
  } else {
    console.error('%s: Unknown error', message);
  }
};

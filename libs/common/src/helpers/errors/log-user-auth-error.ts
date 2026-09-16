export type AuthErrorObject = {
  message?: string;
  code?: string;
  response?: {
    status?: number | string;
    data?: unknown;
  };
};

/**
 * Logs user authentication errors to the console with a custom message.
 * If certain properties of the error object are missing, it will log default values instead.
 * @param error The error object containing details about the authentication error.
 * @param message A custom message to provide context for the error.
 */
export const logUserAuthError = (error: AuthErrorObject, message: string) => {
  const status = error?.response?.status;
  const errorMessage = error?.message ?? 'Unknown error';
  const errorCode = error?.code ?? 'UNKNOWN';
  const specificError = error?.response?.data ?? 'Unknown error';

  console.error('%s: %s (status: %s, code: %s) %o', message, errorMessage, status, errorCode, specificError);
};

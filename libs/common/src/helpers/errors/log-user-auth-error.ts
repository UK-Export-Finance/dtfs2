export type AuthErrorObject = {
  message?: string;
  code?: string;
  response?: {
    status?: number | string;
    data?: unknown;
  };
};

export const logUserAuthError = (error: AuthErrorObject, message: string) => {
  const status = error?.response?.status;
  const errorMessage = error?.message ?? 'Unknown error';
  const errorCode = error?.code ?? 'UNKNOWN';
  const specificError = error?.response?.data ?? 'Unknown error';

  console.error('%s: %s (status: %s, code: %s) %o', message, errorMessage, status, errorCode, specificError);
};

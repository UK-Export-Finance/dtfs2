import { logUserAuthError } from './log-user-auth-error';

describe('logUserAuthError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the error with the provided message', () => {
    const error = {
      message: 'Test error message',
      code: 'TEST_CODE',
      response: {
        status: 400,
        data: { detail: 'Test error detail' },
      },
    };
    const message = 'Custom log message';

    logUserAuthError(error, message);

    expect(console.error).toHaveBeenCalledWith(
      '%s: %s (status: %s, code: %s) %o',
      message,
      error.message,
      error.response.status,
      error.code,
      error.response.data,
    );
  });

  it('should handle missing properties gracefully', () => {
    const error = {};
    const message = 'Custom log message';

    logUserAuthError(error, message);

    expect(console.error).toHaveBeenCalledWith('%s: %s (status: %s, code: %s) %o', message, 'Unknown error', undefined, 'UNKNOWN', 'Unknown error');
  });
});

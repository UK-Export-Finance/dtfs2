import { logUserAuthError } from './log-user-auth-error';

describe('logUserAuthError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the error with the provided message', () => {
    // Arrange
    const error = {
      message: 'Test error message',
      code: 'TEST_CODE',
      response: {
        status: 400,
        data: { detail: 'Test error detail' },
      },
    };
    const message = 'Custom log message';

    // Act
    logUserAuthError(error, message);

    // Assert
    const expected = ['%s: %s (status: %s, code: %s) %o', message, error.message, error.response.status, error.code, error.response.data];

    expect(console.error).toHaveBeenNthCalledWith(1, ...expected);
  });

  it('should handle missing properties gracefully', () => {
    // Arrange
    const error = {};
    const message = 'Custom log message';

    // Act
    logUserAuthError(error, message);

    // Assert
    const expected = ['%s: %s (status: %s, code: %s) %o', message, 'Unknown error', undefined, 'UNKNOWN', 'Unknown error'];

    expect(console.error).toHaveBeenNthCalledWith(1, ...expected);
  });

  it('should preserve falsy non-nullish values', () => {
    const error = { message: '', code: '', response: { status: 0, data: false } };

    logUserAuthError(error, 'Custom log message');

    expect(console.error).toHaveBeenCalledWith('%s: %s (status: %s, code: %s) %o', 'Custom log message', '', 0, '', false);
  });

  it('should use fallbacks for nullish values while preserving a null status', () => {
    const error = { message: null, code: undefined, response: { status: null, data: null } };

    logUserAuthError(error, 'Custom log message');

    expect(console.error).toHaveBeenCalledWith('%s: %s (status: %s, code: %s) %o', 'Custom log message', 'Unknown error', null, 'UNKNOWN', 'Unknown error');
  });
});

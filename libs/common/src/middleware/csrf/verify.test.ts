import httpMocks, { RequestMethod } from 'node-mocks-http';
import { Request, Response } from 'express';
import createHttpError from 'http-errors';
import { HttpStatusCode } from 'axios';
import { csrfSync } from 'csrf-sync';
import { verify } from './verify';
import { CSRF, SSO_URL, SSO_URL_FORM } from '../../constants';

type CsrfCallback = (error?: unknown) => void;

jest.mock('csrf-sync', () => {
  const mockFn = jest.fn();
  return {
    csrfSync: () => ({
      csrfSynchronisedProtection: mockFn,
    }),
  };
});

const { csrfSynchronisedProtection: mockCsrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: () => '',
}) as unknown as { csrfSynchronisedProtection: jest.Mock<void, [Request, Response, CsrfCallback]> };

describe('verify', () => {
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if req.session does not exist', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      body: {
        _csrf: '1234',
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('Session has not been initialised.');

    // Assert
    expect(next).not.toHaveBeenCalled();
    expect(mockCsrfSynchronisedProtection).not.toHaveBeenCalled();
  });

  it.each(CSRF.VERIFY.SAFE.HTTP_METHODS)('should call next without CSRF verification if HTTP method is %s', (method) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: method as RequestMethod,
      session: {},
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockCsrfSynchronisedProtection).not.toHaveBeenCalled();
  });

  it(`should call next without CSRF verification if the request path matches the ${SSO_URL} redirect URL`, () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      path: SSO_URL,
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockCsrfSynchronisedProtection).not.toHaveBeenCalled();
  });

  it(`should call next without CSRF verification if the request path matches the ${SSO_URL_FORM} redirect URL`, () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      path: SSO_URL_FORM,
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockCsrfSynchronisedProtection).not.toHaveBeenCalled();
  });

  it('should call csrfSynchronisedProtection for all other methods', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'token-value',
      },
    });

    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb());

    // Act
    verify(req, res, next);

    // Assert
    expect(mockCsrfSynchronisedProtection).toHaveBeenCalledTimes(1);
    expect(mockCsrfSynchronisedProtection).toHaveBeenCalledWith(req, res, expect.any(Function));
  });

  it('should strip the _csrf token from the body after successful verification', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'token-value',
        otherField: 'value',
      },
    });

    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb());

    // Act
    verify(req, res, next);

    // Assert
    expect((req.body as Record<string, unknown>)._csrf).toBeUndefined();
    expect((req.body as Record<string, unknown>).otherField).toBe('value');

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should strip the _csrf token from the body even when verification fails', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'invalid-token',
        otherField: 'value',
      },
    });

    const csrfError = createHttpError(403, 'invalid csrf token', { code: 'EBADCSRFTOKEN' });
    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb(csrfError));

    // Act
    verify(req, res, next);

    // Assert
    expect((req.body as Record<string, unknown>)._csrf).toBeUndefined();
    expect((req.body as Record<string, unknown>).otherField).toBe('value');
  });

  it(`should return ${HttpStatusCode.Forbidden} Forbidden when CSRF token is invalid`, () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'invalid-token',
      },
    });

    const csrfError = createHttpError(HttpStatusCode.Forbidden, 'invalid csrf token', { code: 'EBADCSRFTOKEN' });
    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb(csrfError));

    // Act
    verify(req, res, next);

    // Assert
    expect(res.statusCode).toBe(HttpStatusCode.Forbidden);
    expect(res._getData()).toBe('Invalid CSRF token.');

    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with the error when a non-CSRF error occurs', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'token-value',
      },
    });

    const genericError = new Error('Something went wrong');
    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb(genericError));

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(genericError);
  });

  it('should call next without error when no error is passed to the callback', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: 'valid-token',
      },
    });

    mockCsrfSynchronisedProtection.mockImplementation((_req, _res, cb: CsrfCallback) => cb());

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(undefined);
  });
});

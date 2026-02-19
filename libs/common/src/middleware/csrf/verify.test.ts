import httpMocks, { RequestMethod } from 'node-mocks-http';
import crypto from 'crypto';
import { verify } from './verify';
import { CSRF } from '../../constants';
import { getEpochMs } from '../../helpers/date';

jest.mock('crypto');

describe('verify', () => {
  const next = jest.fn();
  const now = getEpochMs();
  const oneHourAgo = now - CSRF.TOKEN.MAX_AGE;

  const UNSAFE_METHOD = ['POST', 'PUT', 'PATCH', 'DELETE', 'TRACE', 'CONNECT'];
  const invalidTokens = [':', 'ABCD:', ':0', 'ABCD:ABCD', ' ', 'TAMPERED'];
  const expiredEpochs = [0, 1, oneHourAgo];

  beforeEach(() => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('ABCD'),
    };

    (crypto.createHmac as jest.Mock).mockReturnValue(mockHash);
    (crypto.timingSafeEqual as jest.Mock).mockReturnValueOnce(true);
  });

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
    expect(crypto.createHmac).not.toHaveBeenCalled();
  });

  it.each(CSRF.VERIFY.SAFE.HTTP_METHODS)('should return next and not call HMAC if HTTP method is %s', (method) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: method as RequestMethod,
      session: {
        csrf: '1234',
      },
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).not.toHaveBeenCalled();
  });

  it('should copy CSRF from query to body, when supplied in req.query', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {
        csrf: '1234',
      },
      query: {
        _csrf: `ABCD:${now}`,
      },
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(req.body).toEqual({
      _csrf: `ABCD:${now}`,
    });

    expect(next).toHaveBeenCalledTimes(1);

    expect(crypto.createHmac).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).toHaveBeenLastCalledWith('SHA512', '1234');
  });

  it('should throw an error if there is no CSRF session secret', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'POST',
      session: {},
      body: {
        _csrf: `ABCD:${now}`,
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('Invalid CSRF secret.');

    // Assert
    expect(next).toHaveBeenCalledTimes(0);
    expect(crypto.createHmac).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if there is no CSRF client token', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'PUT',
      session: {
        csrf: '1234',
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('Invalid CSRF token.');

    // Assert
    expect(next).toHaveBeenCalledTimes(0);
    expect(crypto.createHmac).toHaveBeenCalledTimes(0);
  });

  it.each(invalidTokens)('should throw an error if the client token is `%s`', (token) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'PATCH',
      session: {
        csrf: '1234',
      },
      body: {
        _csrf: token,
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('Invalid token has been received.');

    // Assert
    expect(next).toHaveBeenCalledTimes(0);
    expect(crypto.createHmac).toHaveBeenCalledTimes(0);
  });

  it.each(expiredEpochs)('should throw an error if the token has expired with supplied epoch as `%i`', (epoch) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'PATCH',
      session: {
        csrf: '1234',
      },
      body: {
        _csrf: `ABCD:${epoch}`,
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('CSRF token is either invalid or has expired.');

    // Assert
    expect(next).toHaveBeenCalledTimes(0);
    expect(crypto.createHmac).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if the client and server hash do not match', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: 'PATCH',
      session: {
        csrf: '1234',
      },
      body: {
        _csrf: `INVALID:${now}`,
      },
    });

    // Act + Assert
    expect(() => verify(req, res, next)).toThrow('Invalid CSRF token has been supplied.');

    // Assert
    expect(next).toHaveBeenCalledTimes(0);

    expect(crypto.createHmac).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).toHaveBeenLastCalledWith('SHA512', '1234');

    expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);
    expect(crypto.timingSafeEqual).toHaveBeenCalledWith(Buffer.from('INVALID', 'hex'), Buffer.from('ABCD', 'hex'));
  });

  it.each(UNSAFE_METHOD)('should return next and call HMAC if HTTP method is %s', (method) => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      method: method as RequestMethod,
      session: {
        csrf: '1234',
      },
      body: {
        _csrf: `ABCD:${now}`,
      },
    });

    // Act
    verify(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);

    expect(crypto.createHmac).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).toHaveBeenLastCalledWith('SHA512', '1234');

    expect(crypto.timingSafeEqual).toHaveBeenCalledTimes(1);
    expect(crypto.timingSafeEqual).toHaveBeenCalledWith(Buffer.from('ABCD', 'hex'), Buffer.from('ABCD', 'hex'));
  });
});

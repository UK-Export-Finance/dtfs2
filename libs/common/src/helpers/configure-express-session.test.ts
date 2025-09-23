import session from 'express-session';
import { COOKIE } from '../constants';
import { expressSession } from './configure-express-session';
import { redisStore } from './configure-redis-cache';

jest.mock('dotenv', () => ({
  config: jest.fn(),
}));
jest.mock('express-session', () => jest.fn());
jest.mock('./configure-redis-cache', () => ({
  redisStore: jest.fn(() => undefined),
}));

console.error = jest.fn();

describe('expressSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error when secret session does not exist', () => {
    // Arrange
    delete process.env.SESSION_SECRET;

    // Act + Assert
    expect(() => expressSession()).toThrow('Invalid environment variable `SESSION_SECRET`');

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Invalid environment variable `SESSION_SECRET` value supplied %s', undefined);
  });

  it('should call session with secure cookie name, when HTTPS is enabled', () => {
    // Arrange
    process.env.HTTPS = '1';
    process.env.SESSION_SECRET = '1234';

    const mockOptions = {
      name: COOKIE.NAME.SECURE,
      cookie: {
        secure: true,
        path: COOKIE.PATH,
        httpOnly: COOKIE.HTTP_ONLY,
        sameSite: COOKIE.SAME_SITE,
        maxAge: COOKIE.MAX_AGE,
      },
      secret: '1234',
      store: undefined,
      resave: false,
      saveUninitialized: true,
    };

    // Act
    expressSession();

    // Assert
    expect(redisStore).toHaveBeenCalledTimes(1);
    expect(redisStore).toHaveBeenCalledWith();

    expect(session).toHaveBeenCalledTimes(1);
    expect(session).toHaveBeenCalledWith(mockOptions);
  });

  it('should call session with unsecure cookie name, when HTTPS is not enabled', () => {
    // Arrange
    process.env.HTTPS = '0';
    process.env.SESSION_SECRET = '1234';

    const mockOptions = {
      name: COOKIE.NAME.UNSECURE,
      cookie: {
        secure: false,
        path: COOKIE.PATH,
        httpOnly: COOKIE.HTTP_ONLY,
        sameSite: COOKIE.SAME_SITE,
        maxAge: COOKIE.MAX_AGE,
      },
      secret: '1234',
      store: undefined,
      resave: false,
      saveUninitialized: true,
    };

    // Act
    expressSession();

    // Assert
    expect(redisStore).toHaveBeenCalledTimes(1);
    expect(redisStore).toHaveBeenCalledWith();

    expect(session).toHaveBeenCalledTimes(1);
    expect(session).toHaveBeenCalledWith(mockOptions);
  });

  it('should call session with unsecure cookie name, when HTTPS is not defined', () => {
    // Arrange
    delete process.env.HTTPS;
    process.env.SESSION_SECRET = 'ABCD';

    const mockOptions = {
      name: COOKIE.NAME.UNSECURE,
      cookie: {
        secure: false,
        path: COOKIE.PATH,
        httpOnly: COOKIE.HTTP_ONLY,
        sameSite: COOKIE.SAME_SITE,
        maxAge: COOKIE.MAX_AGE,
      },
      secret: 'ABCD',
      store: undefined,
      resave: false,
      saveUninitialized: true,
    };

    // Act
    expressSession();

    // Assert
    expect(redisStore).toHaveBeenCalledTimes(1);
    expect(redisStore).toHaveBeenCalledWith();

    expect(session).toHaveBeenCalledTimes(1);
    expect(session).toHaveBeenCalledWith(mockOptions);
  });
});

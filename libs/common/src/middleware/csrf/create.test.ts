import httpMocks from 'node-mocks-http';
import crypto from 'crypto';
import { create } from './create';

jest.mock('crypto');

describe('create', () => {
  const next = jest.fn();

  beforeEach(() => {
    const mockHash = {
      update: jest.fn().mockReturnThis(),
      digest: jest.fn().mockReturnValue('ABCD'),
    };

    (crypto.randomBytes as jest.Mock).mockReturnValue('1234567890');
    (crypto.createHmac as jest.Mock).mockReturnValue(mockHash);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if req.session does not exist', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks();

    // Act + Assert
    expect(() => create(req, res, next)).toThrow('Session has not been initialised.');

    // Assert
    expect(next).not.toHaveBeenCalled();
  });

  it('should not create CSRF if already exists', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      session: {
        csrf: '1234',
      },
    });

    // Act
    create(req, res, next);

    // Assert
    expect(req.session.csrf).toBe('1234');
    expect(res.locals.csrfToken).toContain('ABCD:');

    expect(crypto.randomBytes).not.toHaveBeenCalled();
    expect(crypto.createHmac).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).toHaveBeenCalledWith('SHA512', '1234');

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should create CSRF if not already created', () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({ session: {} });

    // Act
    create(req, res, next);

    // Assert
    expect(req.session.csrf).toContain('1234567890');
    expect(res.locals.csrfToken).toContain('ABCD:');

    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
    expect(crypto.randomBytes).toHaveBeenCalledWith(128);

    expect(crypto.createHmac).toHaveBeenCalledTimes(1);
    expect(crypto.createHmac).toHaveBeenCalledWith('SHA512', '1234567890');

    expect(next).toHaveBeenCalledTimes(1);
  });
});

import httpMocks from 'node-mocks-http';
import { Request } from 'express';
import { create } from './create';
import { SSO_URL, SSO_URL_FORM } from '../../constants';
import { generateToken } from './csrf-sync-instance';

jest.mock('./csrf-sync-instance', () => ({
  generateToken: jest.fn(),
}));

const mockGenerateToken = generateToken as jest.Mock<string, [Request]>;

describe('create', () => {
  const next = jest.fn();

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

  it(`should skip CSRF token generation for ${SSO_URL} URL`, () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      session: {},
      path: SSO_URL,
    });

    // Act
    create(req, res, next);

    // Assert
    expect(mockGenerateToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it(`should skip CSRF token generation for ${SSO_URL_FORM} URL`, () => {
    // Arrange
    const { req, res } = httpMocks.createMocks({
      session: {},
      path: SSO_URL_FORM,
    });

    // Act
    create(req, res, next);

    // Assert
    expect(mockGenerateToken).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should generate a CSRF token', () => {
    // Arrange
    const mockToken = 'mock-csrf-token';
    mockGenerateToken.mockReturnValue(mockToken);

    const { req, res } = httpMocks.createMocks({ session: {} });

    // Act
    create(req, res, next);

    // Assert
    expect(mockGenerateToken).toHaveBeenCalledTimes(1);
    expect(mockGenerateToken).toHaveBeenCalledWith(req);
  });

  it('should attach the CSRF token to res.locals and call next', () => {
    // Arrange
    const mockToken = 'mock-csrf-token';
    mockGenerateToken.mockReturnValue(mockToken);

    const { req, res } = httpMocks.createMocks({ session: {} });

    // Act
    create(req, res, next);

    // Assert
    expect(res.locals.csrfToken).toBe(mockToken);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

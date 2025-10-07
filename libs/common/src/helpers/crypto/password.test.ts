import crypto from 'crypto';
import { generatePasswordHash } from './password';

jest.mock('crypto');

describe('password', () => {
  const mockPassword = 'AbC!2345';
  const mockSaltHex = 'ABC123DEF';
  const mockHashHex = 'ABCDEFGHIJK1234567890';

  beforeEach(() => {
    const mockSaltBuffer = { toString: jest.fn().mockReturnValue(mockSaltHex) };
    const mockHashBuffer = { toString: jest.fn().mockReturnValue(mockHashHex) };

    (crypto.randomBytes as jest.Mock).mockReturnValue(mockSaltBuffer);
    (crypto.pbkdf2Sync as jest.Mock).mockReturnValue(mockHashBuffer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should crypto functions when generating salt and hash', () => {
    // Arrange

    // Act
    generatePasswordHash(mockPassword);

    // Assert
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
    expect(crypto.randomBytes).toHaveBeenCalledWith(128);

    expect(crypto.pbkdf2Sync).toHaveBeenCalledTimes(1);
    expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(mockPassword, mockSaltHex, 10000, 64, 'SHA512');
  });

  it("should generate password's salt and hash when supplied with a string password", () => {
    // Arrange

    // Act
    const result = generatePasswordHash(mockPassword);

    // Assert
    expect(result).toEqual({
      salt: mockSaltHex,
      hash: mockHashHex,
    });

    expect(result).toHaveProperty('salt');
    expect(result).toHaveProperty('hash');

    expect(result.salt).toEqual(expect.any(String));
    expect(result.hash).toEqual(expect.any(String));

    expect(result.salt.length).toBeGreaterThan(0);
    expect(result.hash.length).toBeGreaterThan(0);
  });
});

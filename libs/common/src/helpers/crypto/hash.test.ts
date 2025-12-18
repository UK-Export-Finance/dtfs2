import crypto from 'crypto';
import { hash } from './hash';
import { CRYPTO } from '../../constants';

jest.mock('crypto');

describe('hash', () => {
  const mockPassword = 'AbC!2345';

  const mockSaltString = '111';
  const mockHashBuffer = Buffer.from([222]);

  const emptyStrings = ['', '   ', String()];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate a password hash as a buffer', () => {
    // Arrange
    (crypto.pbkdf2Sync as jest.Mock).mockReturnValue(mockHashBuffer);

    // Act
    const response = hash(mockPassword, mockSaltString);

    // Assert
    expect(crypto.pbkdf2Sync).toHaveBeenCalledTimes(1);
    expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
      mockPassword,
      mockSaltString,
      CRYPTO.HASHING.ITERATIONS,
      CRYPTO.HASHING.KEY_LENGTH,
      CRYPTO.HASHING.ALGORITHM,
    );

    expect(response).toEqual(mockHashBuffer);
  });

  it.each(emptyStrings)('should throw an error when the salt is `%s`', (salt) => {
    // Act + Assert
    expect(() => hash(mockPassword, salt)).toThrow(new Error('Salt cannot be empty'));

    // Assert
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalled();
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalledWith(mockPassword, salt, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);
  });

  it.each(emptyStrings)('should throw an error when the password is `%s`', (password) => {
    // Act + Assert
    expect(() => hash(password, mockSaltString)).toThrow(new Error('Password cannot be empty'));

    // Assert
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalled();
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalledWith(
      password,
      mockSaltString,
      CRYPTO.HASHING.ITERATIONS,
      CRYPTO.HASHING.KEY_LENGTH,
      CRYPTO.HASHING.ALGORITHM,
    );
  });
});

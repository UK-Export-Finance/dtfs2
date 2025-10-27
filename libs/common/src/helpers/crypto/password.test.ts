import crypto from 'crypto';
import { CRYPTO } from '../../constants';
import { generatePasswordHash } from './password';

jest.mock('crypto');
console.error = jest.fn();

describe('password', () => {
  const mockPassword = 'AbC!2345';

  const mockSaltBuffer = Buffer.from([111]);
  const mockHashBuffer = Buffer.from([222]);

  const mockSaltString = mockSaltBuffer.toString('hex');

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return string salt and hash', () => {
    // Arrange
    (crypto.randomBytes as jest.Mock).mockReturnValue(mockSaltBuffer);
    (crypto.pbkdf2Sync as jest.Mock).mockReturnValue(mockHashBuffer);

    // Act
    const response = generatePasswordHash(mockPassword);

    // Assert
    expect(console.error).not.toHaveBeenCalled();

    // Salt
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.BYTES);
    expect(crypto.randomBytes(CRYPTO.SALT.BYTES)).toEqual(mockSaltBuffer);

    // Hash
    expect(crypto.pbkdf2Sync).toHaveBeenCalledTimes(1);
    expect(crypto.pbkdf2Sync).toHaveBeenCalledWith(
      mockPassword,
      mockSaltString,
      CRYPTO.HASHING.ITERATIONS,
      CRYPTO.HASHING.KEY_LENGTH,
      CRYPTO.HASHING.ALGORITHM,
    );
    expect(crypto.pbkdf2Sync(mockPassword, mockSaltString, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM)).toEqual(
      mockHashBuffer,
    );

    // String response
    expect(response).toEqual({
      salt: mockSaltBuffer.toString('hex'),
      hash: mockHashBuffer.toString('hex'),
    });
  });

  it('should throw an error, when the salt is an empty string', () => {
    // Arrange
    (crypto.randomBytes as jest.Mock).mockReturnValue('');

    // Act
    const response = generatePasswordHash(mockPassword);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);

    // Salt
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.BYTES);
    expect(crypto.randomBytes(CRYPTO.SALT.BYTES)).toEqual('');

    // Hash
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalled();
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalledWith(mockPassword, '', CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);

    expect(console.error).toHaveBeenCalledWith('An error has occurred while generating password %o', new Error('Salt cannot be empty'));
    expect(response).toEqual({
      salt: '',
      hash: '',
    });
  });

  it('should throw an error when the password is an empty string', () => {
    // Arrange
    (crypto.randomBytes as jest.Mock).mockReturnValue(mockSaltBuffer);

    // Act
    const response = generatePasswordHash('');

    // Assert
    expect(console.error).toHaveBeenCalledTimes(1);

    // Salt
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.BYTES);
    expect(crypto.randomBytes(CRYPTO.SALT.BYTES)).toEqual(mockSaltBuffer);

    // Hash
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalled();
    expect(crypto.pbkdf2Sync).not.toHaveBeenCalledWith('', mockSaltString, CRYPTO.HASHING.ITERATIONS, CRYPTO.HASHING.KEY_LENGTH, CRYPTO.HASHING.ALGORITHM);

    expect(console.error).toHaveBeenCalledWith('An error has occurred while generating password %o', new Error('Password cannot be empty'));
    expect(response).toEqual({
      salt: '',
      hash: '',
    });
  });
});

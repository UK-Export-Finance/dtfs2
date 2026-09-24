import crypto from 'crypto';
import { salt } from './salt';
import { CRYPTO } from '../../constants';

jest.mock('crypto');

describe('salt', () => {
  const mockSalt = Buffer.from([123]);

  beforeEach(() => {
    (crypto.randomBytes as jest.Mock).mockReturnValue(mockSalt);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a Buffer type, when called', () => {
    // Act
    const response = salt();

    // Assert
    expect(response).toBeDefined();
    expect(Buffer.isBuffer(response)).toEqual(true);
  });

  it('should call crypto.randomBytes with 128 bytes when no byte size is provided', () => {
    // Act
    const response = salt();

    // Assert
    expect(response).toBe(mockSalt);

    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.BYTES);
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
  });

  it('should call crypto.randomBytes with the provided byte size', () => {
    // Act
    const response = salt(CRYPTO.SALT.OTP_BYTES);

    // Assert
    expect(response).toBe(mockSalt);

    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.OTP_BYTES);
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
  });
});

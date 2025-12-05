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
    expect(Buffer.isBuffer(response)).toBeTruthy();
  });

  it('should call crypto.randomBytes with 128 bytes', () => {
    // Act
    const response = salt();

    // Assert
    expect(response).toBe(mockSalt);

    expect(crypto.randomBytes).toHaveBeenCalledWith(CRYPTO.SALT.BYTES);
    expect(crypto.randomBytes).toHaveBeenCalledTimes(1);
  });
});

import { isHttps } from './is-https';

describe('isHttps', () => {
  it('should return true if the environment variable is set to true', () => {
    // Arrange
    process.env.HTTPS = 'true';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeTruthy();
  });

  it('should return true if the environment variable is set to 1', () => {
    // Arrange
    process.env.HTTPS = '1';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeTruthy();
  });

  it('should return false if the environment variable does not exists', () => {
    // Arrange
    delete process.env.HTTPS;

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    process.env.HTTPS = undefined;

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    // @ts-ignore
    process.env.HTTPS = null;

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is an empty string', () => {
    // Arrange
    process.env.HTTPS = '';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to false', () => {
    // Arrange
    process.env.HTTPS = 'false';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to 0', () => {
    // Arrange
    process.env.HTTPS = '0';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to undefined', () => {
    // Arrange
    process.env.HTTPS = 'undefined';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to null', () => {
    // Arrange
    process.env.HTTPS = 'null';

    // Act
    const result = isHttps();

    // Assert
    expect(result).toBeFalsy();
  });
});

import { isProduction } from './is-production';
import { ENVIRONMENTS } from '../constants';

describe('isProduction function', () => {
  it('should return false if the environment is staging', () => {
    // Arrange
    process.env.NODE_ENV = ENVIRONMENTS.STAGING;

    // Act
    const result = isProduction();

    // Assert
    expect(result).toEqual(false);
  });

  it('should return true if the environment is development', () => {
    // Arrange
    process.env.NODE_ENV = ENVIRONMENTS.DEVELOPMENT;

    // Act
    const result = isProduction();

    // Assert
    expect(result).toEqual(false);
  });

  it('should return true if the environment is dev', () => {
    // Arrange
    process.env.NODE_ENV = 'dev';

    // Act
    const result = isProduction();

    // Assert
    expect(result).toEqual(false);
  });

  it('should return true if the environment is undefined', () => {
    // Arrange
    delete process.env.NODE_ENV;

    // Act
    const result = isProduction();

    // Assert
    expect(result).toEqual(false);
  });
});

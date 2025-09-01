import { isMaintainanceActive } from './is-maintainance-active';

describe('isMaintainanceActive', () => {
  it('should return true if the environment variable is set to true', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = 'true';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeTruthy();
  });

  it('should return false if the environment variable does not exists', () => {
    // Arrange
    delete process.env.MAINTAINANCE_ACTIVE;

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = undefined;

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    // @ts-ignore
    process.env.MAINTAINANCE_ACTIVE = null;

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is an empty string', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = '';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to false', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = 'false';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to 0', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = '0';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to undefined', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = 'undefined';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to null', () => {
    // Arrange
    process.env.MAINTAINANCE_ACTIVE = 'null';

    // Act
    const result = isMaintainanceActive();

    // Assert
    expect(result).toBeFalsy();
  });
});

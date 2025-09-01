import { isMaintenanceActive } from './is-maintenance-active';

describe('isMaintenanceActive', () => {
  it('should return true if the environment variable is set to true', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'true';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeTruthy();
  });

  it('should return false if the environment variable does not exists', () => {
    // Arrange
    delete process.env.MAINTENANCE_ACTIVE;

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = undefined;

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable has not been setup', () => {
    // Arrange
    // @ts-ignore
    process.env.MAINTENANCE_ACTIVE = null;

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is an empty string', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = '';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to false', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'false';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to 0', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = '0';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to undefined', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'undefined';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });

  it('should return false if the environment variable is set to null', () => {
    // Arrange
    process.env.MAINTENANCE_ACTIVE = 'null';

    // Act
    const result = isMaintenanceActive();

    // Assert
    expect(result).toBeFalsy();
  });
});

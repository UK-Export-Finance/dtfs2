import { getMaintenanceTimestamp } from './get-maintenance-timestamp';

const validEpochs = [
  {
    epoch: 0,
    value: '01:00am on Thursday 01 January 1970',
  },
  {
    epoch: 1756996452406,
    value: '03:34pm on Thursday 04 September 2025',
  },
  {
    epoch: 253399622400000,
    value: '12:00am on Wednesday 01 December 9999',
  },
];

describe('getMaintenanceTimestamp', () => {
  const originalEnv = { ...process.env };

  afterAll(() => {
    process.env = originalEnv;
  });

  it.each(validEpochs)('should give epoch as string when environment variable is set to $epoch', ({ epoch, value }) => {
    // Arrange
    process.env.MAINTENANCE_TIMESTAMP = String(epoch);

    // Act
    const result = getMaintenanceTimestamp();

    // Assert
    expect(result).toBe(value);
  });

  it('should give current timestamp as a string when no environment variable is set', () => {
    // Arrange
    process.env.MAINTENANCE_TIMESTAMP = '';

    // Act
    const result = getMaintenanceTimestamp();

    // Assert
    expect(result).toContain(' on ');
  });
});

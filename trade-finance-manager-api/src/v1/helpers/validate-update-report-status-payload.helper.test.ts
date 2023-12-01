import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';
import {
  validatePayloadStatus,
  validatePayloadWithBankId,
  validatePayloadWithReportId,
  validateUpdateReportStatusPayload,
} from './validate-update-report-status-payload.helper';

console.error = jest.fn();

describe('validatePayloadStatus', () => {
  it("should return false when the 'reportWithStatus' does not contain the field 'status'", () => {
    // Arrange
    const reportWithStatus = {
      report: {
        id: 'abc',
      },
    };

    // Act
    const result = validatePayloadStatus(reportWithStatus);

    // Assert
    expect(result).toBe(false);
  });

  it("should return false if 'reportWithStatus' contains the field 'status' but that status is invalid", () => {
    // Arrange
    const reportWithStatus = {
      report: {
        id: 'abc',
      },
      status: 'INVALID_STATUS',
    };

    // Act
    const result = validatePayloadStatus(reportWithStatus);

    // Assert
    expect(result).toBe(false);
  });

  it("should return true if 'reportWithStatus' contains a valid 'status' field", () => {
    // Arrange
    const reportWithStatus = {
      report: {
        id: 'abc',
      },
      status: 'REPORT_NOT_RECEIVED',
    };

    // Act
    const result = validatePayloadStatus(reportWithStatus);

    // Assert
    expect(result).toBe(true);
  });
});

describe('validatePayloadWithBankId', () => {
  it('should return false when the report does not contain any of the required fields', () => {
    // Arrange
    const report = {};

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report month is not an integer', () => {
    // Arrange
    const report = {
      month: 1.5,
      year: 2023,
      bankId: '123',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report month is less than 1', () => {
    // Arrange
    const report = {
      month: 0,
      year: 2023,
      bankId: '123',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report month is greater than 12', () => {
    // Arrange
    const report = {
      month: 13,
      year: 2023,
      bankId: '123',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report year is not an integer', () => {
    // Arrange
    const report = {
      month: 3,
      year: 2023.1,
      bankId: '123',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report bankId is not a string', () => {
    // Arrange
    const report = {
      month: 3,
      year: 2023,
      bankId: 123,
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report contains extra fields', () => {
    // Arrange
    const report = {
      month: 3,
      year: 2023,
      bankId: '123',
      uploadedBy: 'Test user',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when the report fields are all valid', () => {
    // Arrange
    const report = {
      month: 3,
      year: 2023,
      bankId: '123',
    };

    // Act
    const result = validatePayloadWithBankId(report);

    // Assert
    expect(result).toBe(true);
  });
});

describe('validatePayloadWithReportId', () => {
  it('should return false when the report id is not a valid mongo id', () => {
    // Arrange
    const report = {
      id: 'abc',
    };

    // Act
    const result = validatePayloadWithReportId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false when the report id is valid but the report contains extra fields', () => {
    // Arrange
    const report = {
      id: '5ce819935e539c343f141ece',
      month: 1,
    };

    // Act
    const result = validatePayloadWithReportId(report);

    // Assert
    expect(result).toBe(false);
  });

  it('should return true when the report id is a valid mongo id', () => {
    // Arrange
    const report = {
      id: '5ce819935e539c343f141ece',
    };

    // Act
    const result = validatePayloadWithReportId(report);

    // Assert
    expect(result).toBe(true);
  });
});

describe('validateUpdateReportStatusPayload', () => {
  it('should throw the correct error when the payload does not match any expected payload format', () => {
    // Arrange
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: {
          uploadedBy: 'Some user',
        },
      },
    ];

    // Act
    const callFunction = () => validateUpdateReportStatusPayload(reportsWithStatus);

    // Assert
    expect(callFunction).toThrow(new Error("'reportsWithStatus' array does not match any expected payload format"));
  });

  it('should throw the correct error when the payload contains extra fields', () => {
    // Arrange
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: {
          id: '5ce819935e539c343f141ece',
        },
        extraField: 'Extra information',
      },
    ];

    // Act
    const callFunction = () => validateUpdateReportStatusPayload(reportsWithStatus);

    // Assert
    expect(callFunction).toThrow(new Error("'reportsWithStatus' array does not match any expected payload format"));
  });

  it('should return true if the payload has the correct format (with a report id)', () => {
    // Arrange
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: {
          id: '5ce819935e539c343f141ece',
        },
      },
    ];

    // Act
    const result = validateUpdateReportStatusPayload(reportsWithStatus);

    // Assert
    expect(result).toBe(true);
  });

  it('should return true if the payload has the correct format (with a month, year and bank id)', () => {
    // Arrange
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: {
          month: 1,
          year: 2023,
          bankId: '123',
        },
      },
    ];

    // Act
    const result = validateUpdateReportStatusPayload(reportsWithStatus);

    // Assert
    expect(result).toBe(true);
  });
});

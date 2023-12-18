import { ReportWithStatus } from '../../types/utilisation-report-service';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';
import { isValidMongoId } from '../validation/validateIds';

const isReportWithStatus = (reportWithStatus: unknown): reportWithStatus is ReportWithStatus => {
  if (reportWithStatus === null || typeof reportWithStatus !== 'object') {
    return false;
  }
  return 'report' in reportWithStatus && 'status' in reportWithStatus;
};

export const validatePayloadStatus = (reportWithStatus: object): boolean => {
  const reportWithStatusContainsStatus = 'status' in reportWithStatus;
  if (!reportWithStatusContainsStatus) {
    return false;
  }

  const { status } = reportWithStatus;
  switch (status) {
    case UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED:
      return true;
    case UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED:
      return true;
    default:
      return false;
  }
};

export const validatePayloadWithBankId = (report: object): boolean => {
  const reportContainsBankId = 'bankId' in report;
  const reportContainsMonth = 'month' in report;
  const reportContainsYear = 'year' in report;
  if (!reportContainsBankId || !reportContainsMonth || !reportContainsYear) {
    return false;
  }

  const reportContainsExtraKeys = Object.keys(report).length > 3;
  if (reportContainsExtraKeys) {
    return false;
  }

  const { bankId, month, year } = report;

  if (typeof month !== 'number' || !Number.isInteger(month)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }

  if (typeof year !== 'number' || !Number.isInteger(year)) {
    return false;
  }

  if (typeof bankId !== 'string') {
    return false;
  }

  return true;
};

export const validatePayloadWithReportId = (report: object): boolean => {
  if (report === null || typeof report !== 'object') {
    return false;
  }

  const reportContainsReportId = 'id' in report;
  if (!reportContainsReportId) {
    return false;
  }

  const reportContainsExtraKeys = Object.keys(report).length > 1;
  if (reportContainsExtraKeys) {
    return false;
  }

  const { id } = report;
  const reportIdIsValidMongoId = typeof id === 'string' && (isValidMongoId(id) as boolean);
  if (!reportIdIsValidMongoId) {
    return false;
  }
  return true;
};

export const validateUpdateReportStatusPayload = (reportsWithStatus: unknown[]): boolean | undefined => {
  const isValidPayload = reportsWithStatus.every((reportWithStatus: unknown) => {
    if (!isReportWithStatus(reportWithStatus)) {
      return false;
    }

    const isValidPayloadStatus = validatePayloadStatus(reportWithStatus);
    if (!isValidPayloadStatus) {
      return false;
    }

    const reportWithStatusContainsExtraKeys = Object.keys(reportWithStatus).length > 2;
    if (reportWithStatusContainsExtraKeys) {
      return false;
    }

    const { report } = reportWithStatus;
    if (!report) {
      return false;
    }

    const isValidPayloadWithReportId = validatePayloadWithReportId(report);
    const isValidPayloadWithBankId = validatePayloadWithBankId(report);
    if (isValidPayloadWithReportId || isValidPayloadWithBankId) {
      return true;
    }

    return false;
  });

  if (!isValidPayload) {
    throw new Error("'reportsWithStatus' array does not match any expected payload format");
  }

  return true;
};

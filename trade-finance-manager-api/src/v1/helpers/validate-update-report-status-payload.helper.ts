import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../constants';
import { isValidMongoId } from '../validation/validateIds';

export const validatePayloadStatus = (reportWithStatus: any): boolean => {
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

export const validatePayloadWithBankId = (report: any): boolean => {
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

  if (!Number.isInteger(month)) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }

  if (!Number.isInteger(year)) {
    return false;
  }

  if (typeof bankId !== 'string') {
    return false;
  }

  return true;
};

export const validatePayloadWithReportId = (report: any): boolean => {
  const reportContainsReportId = 'id' in report;
  if (!reportContainsReportId) {
    return false;
  }

  const reportContainsExtraKeys = Object.keys(report).length > 1;
  if (reportContainsExtraKeys) {
    return false;
  }

  const { id } = report;
  const reportIdIsValidMongoId = isValidMongoId(id);
  if (!reportIdIsValidMongoId) {
    return false;
  }
  return true;
};

export const validateUpdateReportStatusPayload = (reportsWithStatus: any[]): boolean | undefined => {
  const isValidPayload = reportsWithStatus.every((reportWithStatus: any) => {
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

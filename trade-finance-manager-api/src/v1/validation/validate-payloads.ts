import { asString } from '../../utils/validation';
import { isValidMongoId } from './validateIds';

export const validateUpdateUtilisationReportPayloadReport = (report: object) => {
  if ('id' in report) {
    const isValidReportId = isValidMongoId(asString(report.id, 'report.id'));
    if (!isValidReportId) {
      throw new Error("'report.id' must be a valid mongo id string");
    }
    return true;
  }

  const reportContainsBankId = 'bankId' in report;
  const reportContainsMonth = 'month' in report;
  const reportContainsYear = 'year' in report;
  if (!reportContainsBankId || !reportContainsMonth || !reportContainsYear) {
    throw new Error("'report' must contain either the properties 'bankId', 'month' and 'year' or the property 'id'");
  }

  if (typeof report.bankId !== 'string' || !report.bankId.match(/^\d+$/)) {
    throw new Error("'bankId' must be a string containing only digits");
  }

  if (typeof report.month !== 'number' || report.month > 12 || report.month < 1) {
    throw new Error("'month' must be a number between 1 and 12 inclusive");
  }

  if (typeof report.year !== 'number' || report.year < 0) {
    throw new Error("'year' must be a positive number");
  }

  return true;
};

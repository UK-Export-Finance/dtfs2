import { BankReportPeriodSchedule, BankReportPeriodSchedulePeriod, OneIndexedMonth } from '@ukef/dtfs2-common';
import { InvalidReportPeriodScheduleError } from '../../errors/invalid-report-period-schedule';

const isJanuary = (month: OneIndexedMonth) => month === 1;

const isDecember = (month: OneIndexedMonth) => month === 12;

const isStartMonthJanuary = (period: BankReportPeriodSchedulePeriod): boolean => isJanuary(period.startMonth);

const isPeriodSpanningTwoYears = (period: BankReportPeriodSchedulePeriod): boolean => period.startMonth > period.endMonth;

const areConsecutiveMonths = (firstMonth: OneIndexedMonth, followingMonth: OneIndexedMonth): boolean =>
  firstMonth === followingMonth - 1 || (isDecember(firstMonth) && isJanuary(followingMonth));

const isOfTypeBankReportPeriodSchedule = (reportPeriodSchedule: unknown[]): reportPeriodSchedule is BankReportPeriodSchedule =>
  reportPeriodSchedule.every((scheduledPeriod) => {
    if (typeof scheduledPeriod !== 'object' || scheduledPeriod == null) {
      return false;
    }

    if (!('startMonth' in scheduledPeriod) || typeof scheduledPeriod.startMonth !== 'number') {
      return false;
    }

    if (!('endMonth' in scheduledPeriod) || typeof scheduledPeriod.endMonth !== 'number') {
      return false;
    }
    return true;
  });

const getRange = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => index + start);

const getMonthsCoveredByPeriod = (period: BankReportPeriodSchedulePeriod): OneIndexedMonth[] => {
  if (period.startMonth === period.endMonth) {
    return [period.startMonth];
  }

  if (isPeriodSpanningTwoYears(period)) {
    return [...getRange(period.startMonth, 12), ...getRange(1, period.endMonth)];
  }

  return getRange(period.startMonth, period.endMonth);
};

const validateFirstPeriodCoversStartOfYear = (reportPeriodSchedule: BankReportPeriodSchedule): void => {
  if (reportPeriodSchedule.length < 0) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule does not contain any report periods');
  }

  if (!isStartMonthJanuary(reportPeriodSchedule[0]) && !isPeriodSpanningTwoYears(reportPeriodSchedule[0])) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule does not start from January or period which spans 2 years');
  }
};

const validateReportPeriodScheduleCoversTheYearChronologically = (reportPeriodSchedule: BankReportPeriodSchedule): void => {
  const monthsInSchedule = reportPeriodSchedule.flatMap((period) => getMonthsCoveredByPeriod(period));
  if (monthsInSchedule.length !== 12) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule does not contain 12 months');
  }

  if (new Set(monthsInSchedule).size !== monthsInSchedule.length) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule contains duplicated months');
  }

  monthsInSchedule.forEach((month) => {
    if (month < 1 || month > 12) {
      throw new InvalidReportPeriodScheduleError('Utilisation report period schedule contains invalid months');
    }
  });

  for (let i = 0; i < 11; i += 1) {
    if (!areConsecutiveMonths(monthsInSchedule[i], monthsInSchedule[i + 1])) {
      throw new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in correct order');
    }
  }
};

/**
 * Validates that the utilisation report period schedule from the bank is the correct format:
 *  - Every month is accounted for exactly once
 *  - Schedules should be chronological
 *  - If a schedule overlaps 2 years it should be the first in the array
 * Throws an error if schedule is not valid
 */
export const validateUtilisationReportPeriodSchedule = (reportPeriodSchedule: unknown): void => {
  if (!reportPeriodSchedule || !Array.isArray(reportPeriodSchedule)) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule is missing or the incorrect format');
  }

  if (!isOfTypeBankReportPeriodSchedule(reportPeriodSchedule)) {
    throw new InvalidReportPeriodScheduleError('Utilisation report period schedule is not in the correct format');
  }

  validateFirstPeriodCoversStartOfYear(reportPeriodSchedule);
  validateReportPeriodScheduleCoversTheYearChronologically(reportPeriodSchedule);
};

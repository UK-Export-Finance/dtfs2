import { BankReportPeriodSchedule } from '@ukef/dtfs2-common';

const getMonthsInSchedule = (utilisationReportPeriodSchedule: BankReportPeriodSchedule): { monthsInSchedule: number[], firstScheduleError: string | undefined } => {
  const monthsInSchedule: number[] = [];
  let firstScheduleError;
  if (utilisationReportPeriodSchedule[0].startMonth === 1
    || utilisationReportPeriodSchedule[0].startMonth > utilisationReportPeriodSchedule[0].endMonth) {
    utilisationReportPeriodSchedule.forEach(utilisationReportPeriod => {
      if (utilisationReportPeriod.startMonth === utilisationReportPeriod.endMonth) {
        monthsInSchedule.push(utilisationReportPeriod.startMonth);
      } else if (utilisationReportPeriod.startMonth > utilisationReportPeriod.endMonth) {
          for (let i = utilisationReportPeriod.startMonth; i <= 12; i += 1) {
            monthsInSchedule.push(i);
          }
          for (let i = 1; i <= utilisationReportPeriod.endMonth; i += 1) {
            monthsInSchedule.push(i);
          }
        } else {
          for (let i = utilisationReportPeriod.startMonth; i <= utilisationReportPeriod.endMonth; i += 1) {
            monthsInSchedule.push(i);
          }
        }
    });
  } else {
    firstScheduleError = 'Utilisation Report Period Schedule does not start from January or period which spans 2 years';
  };
  return { monthsInSchedule, firstScheduleError };
}

const isScheduleInOrder = (monthsInSchedule: number[]): boolean => {
  const firstMonthInSchedule = monthsInSchedule[0];
  const lastMonthInSchedule = monthsInSchedule.at(-1);

  let scheduleInOrder = true;
  monthsInSchedule.forEach((monthInSchedule, index) => {
    const nextMonthInSchedule = monthsInSchedule[index + 1];
    if (monthInSchedule === lastMonthInSchedule) {
      if (monthInSchedule === 12) {
        if (firstMonthInSchedule !== 1) {
          scheduleInOrder = false;
        }
      } else if (firstMonthInSchedule - monthInSchedule !== 1) {
        scheduleInOrder = false;
      }
    } else if (monthInSchedule === 12) {
        if (nextMonthInSchedule !== 1) {
          scheduleInOrder = false;
        }
      } else if (nextMonthInSchedule - monthInSchedule !== 1) {
        scheduleInOrder = false;
      }
  })

  return scheduleInOrder;
}

/**
 * Validates that the utilisation report period schedule from the bank is the correct format:
 *  - Every month is accounted for exactly once
 *  - Schedules should be sequential
 *  - If a schedule overlaps 2 years it should be the first in the array
 * Returns error or undefined if schedule is valid.
 */

export const validateUtilisationReportPeriodSchedule = (utilisationReportPeriodSchedule: unknown): string | undefined => {
  let validationError: string | undefined;

  if (!utilisationReportPeriodSchedule || !Array.isArray(utilisationReportPeriodSchedule)) {
    validationError = 'Utilisation Report Period Schedule is missing or the incorrect format';
    return validationError;
  }

  for (let i = 0; i < utilisationReportPeriodSchedule.length; i += 1) {
    if (!('startMonth' in utilisationReportPeriodSchedule[i]) || ! ('endMonth' in utilisationReportPeriodSchedule[i])) {
      validationError = 'Utilisation Report Period Schedule does not have start or end month';
      return validationError;
    };
  };

  const { monthsInSchedule, firstScheduleError } = getMonthsInSchedule(utilisationReportPeriodSchedule as BankReportPeriodSchedule);

  if (firstScheduleError) {
    validationError = firstScheduleError;
    return validationError;
  }

  if (new Set(monthsInSchedule).size !== monthsInSchedule.length) {
    validationError = 'Utilisation Report Period Schedule contains duplicated months';
    return validationError;
  }

  if (monthsInSchedule.length !== 12) {
    validationError = 'Utilisation Report Period Schedule does not contain 12 months';
    return validationError;
  }

  monthsInSchedule.forEach(month => {
    if (month < 1 || month > 12) {
      validationError = 'Utilisation Report Period Schedule contains invalid months';
    };
    return validationError;
  });
  if (validationError) {
    return validationError;
  }

  const scheduleInOrder = isScheduleInOrder(monthsInSchedule);
  if (!scheduleInOrder) {
    validationError = 'Utilisation Report Period Schedule is not in correct order';
    return validationError;
  }

  return validationError;
};
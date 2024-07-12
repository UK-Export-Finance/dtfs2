import { getDaysInMonth, set, startOfDay } from 'date-fns';
import Joi from 'joi';
import { DayMonthYear } from '../types/date';

type ValidationOptions = {
  errRef: string;
  variableDisplayName: string;
};

type ValidationError = {
  errRef: string;
  errMsg: string;
  subFieldErrorRefs?: string[];
};

type ErrorsOrDate =
  | {
      errors: null;
      date: Date;
    }
  | {
      errors: ValidationError[];
    };

export const validateAndParseDayMonthYear = ({ day, month, year }: DayMonthYear, { errRef, variableDisplayName }: ValidationOptions): ErrorsOrDate => {
  const dateIsBlank = !day && !month && !year;
  const dateIsFullyComplete = day && month && year;

  const variableDisplayNameWithCapital = variableDisplayName.charAt(0).toUpperCase() + variableDisplayName.slice(1);

  if (dateIsBlank) {
    return {
      errors: [
        {
          errRef,
          errMsg: `Enter a ${variableDisplayName}`,
          subFieldErrorRefs: [`${errRef}-day`, `${errRef}-month`, `${errRef}-year`],
        },
      ],
    };
  }

  if (!dateIsFullyComplete) {
    let msg = `${variableDisplayNameWithCapital} include a `;
    const subFieldErrorRefs = [];

    if (!day) {
      msg += 'day';
      subFieldErrorRefs.push(`${errRef}-day`);
    }
    if (!month) {
      msg += !day ? ' and month' : 'month';
      subFieldErrorRefs.push(`${errRef}-month`);
    }
    if (!year) {
      msg += !day || !month ? ' and year' : 'year';
      subFieldErrorRefs.push(`${errRef}-year`);
    }

    return {
      errors: [
        {
          errRef,
          errMsg: msg,
          subFieldErrorRefs,
        },
      ],
    };
  }

  const errors = [];

  const oneOrTwoDigitSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
  const fourDigitSchema = Joi.string().length(4).pattern(/^\d+$/).required();

  const dayValidation = oneOrTwoDigitSchema.validate(day);
  const monthValidation = oneOrTwoDigitSchema.validate(month);
  const yearValidation = fourDigitSchema.validate(year);

  if (dayValidation.error) {
    errors.push({
      errRef,
      errMsg: `The day for the ${variableDisplayName} must include 1 or 2 numbers`,
      subFieldErrorRefs: [`${errRef}-day`],
    });
  }
  if (monthValidation.error) {
    errors.push({
      errRef,
      errMsg: `The month for the ${variableDisplayName} must include 1 or 2 numbers`,
      subFieldErrorRefs: [`${errRef}-month`],
    });
  }
  if (yearValidation.error) {
    errors.push({
      errRef,
      errMsg: `The year for the ${variableDisplayName} must include 4 numbers`,
      subFieldErrorRefs: [`${errRef}-year`],
    });
  }

  if (errors.length) {
    return {
      errors,
    };
  }

  if (Number(month) > 12 || Number(month) < 1) {
    errors.push({
      errRef,
      errMsg: `${variableDisplayNameWithCapital} must be in the correct format DD/MM/YYYY`,
      subFieldErrorRefs: [`${errRef}-month`],
    });
  }

  const daysInMonth = getDaysInMonth(
    set(new Date(), {
      year: Number(year),
      month: Number(month) - 1,
    }),
  );

  if (daysInMonth < Number(day) || Number(day) < 1) {
    errors.push({
      errRef,
      errMsg: `${variableDisplayNameWithCapital} must be in the correct format DD/MM/YYYY`,
      subFieldErrorRefs: [`${errRef}-day`],
    });
  }

  if (errors.length) {
    return {
      errors,
    };
  }

  return {
    errors: null,
    date: startOfDay(
      set(new Date(), {
        year: Number(year),
        month: Number(month) - 1,
        date: Number(day),
      }),
    ),
  };
};

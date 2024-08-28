import { getDaysInMonth, set, startOfDay } from 'date-fns';
import Joi from 'joi';
import { DayMonthYear } from '../types/date';
import { ValidationError } from '../types/validation-error';
import { ErrorsOrDate } from '../types/errors-or-date';

type ValidationOptions = {
  errRef: string;
  variableDisplayName: string;
};

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const validateAllFieldsArePresent = ({ day, month, year }: DayMonthYear, { errRef, variableDisplayName }: ValidationOptions): ValidationError[] => {
  const dateIsBlank = !(day || month || year);
  const dateIsFullyComplete = Boolean(day && month && year);

  const variableDisplayNameWithCapital = capitalizeFirstLetter(variableDisplayName);

  if (dateIsBlank) {
    return [
      {
        errRef,
        errMsg: `Enter a ${variableDisplayName}`,
        subFieldErrorRefs: [`${errRef}-day`, `${errRef}-month`, `${errRef}-year`],
      },
    ];
  }

  if (!dateIsFullyComplete) {
    const fieldToValidate = [
      { field: day, name: 'day' },
      { field: month, name: 'month' },
      { field: year, name: 'year' },
    ];

    const { missingFields, subFieldErrorRefs } = fieldToValidate.reduce(
      (acc: { missingFields: string[]; subFieldErrorRefs: string[] }, { field, name }) => {
        if (!field) {
          acc.missingFields.push(name);
          acc.subFieldErrorRefs.push(`${errRef}-${name}`);
        }
        return acc;
      },
      { missingFields: [], subFieldErrorRefs: [] },
    );

    const msg = `${variableDisplayNameWithCapital} must include a ${missingFields.join(' and ')}`;

    return [
      {
        errRef,
        errMsg: msg,
        subFieldErrorRefs,
      },
    ];
  }

  return [];
};

const validateAllFieldsAreNumbers = ({ day, month, year }: DayMonthYear, { errRef, variableDisplayName }: ValidationOptions): ValidationError[] => {
  const oneOrTwoDigitSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
  const fourDigitSchema = Joi.string().length(4).pattern(/^\d+$/).required();

  const fieldToValidate: { field: string; schema: Joi.StringSchema; fieldName: 'day' | 'month' | 'year' }[] = [
    { field: day, schema: oneOrTwoDigitSchema, fieldName: 'day' },
    { field: month, schema: oneOrTwoDigitSchema, fieldName: 'month' },
    { field: year, schema: fourDigitSchema, fieldName: 'year' },
  ];

  const errors: ValidationError[] = fieldToValidate.reduce((acc: ValidationError[], { field, schema, fieldName }) => {
    const validation = schema.validate(field);
    if (validation.error) {
      acc.push({
        errRef,
        errMsg: `The ${fieldName} for the ${variableDisplayName} must include ${fieldName === 'year' ? '4' : '1 or 2'} numbers`,
        subFieldErrorRefs: [`${errRef}-${fieldName}`],
      });
    }
    return acc;
  }, []);

  return errors;
};

const validateAllFieldsAreValid = ({ day, month, year }: DayMonthYear, { errRef, variableDisplayName }: ValidationOptions): ValidationError[] => {
  const variableDisplayNameWithCapital = capitalizeFirstLetter(variableDisplayName);

  const daysInMonth = getDaysInMonth(
    set(new Date(), {
      year: Number(year),
      month: Number(month) - 1,
    }),
  );

  const errors = [];

  if (Number(month) > 12 || Number(month) < 1) {
    errors.push({
      errRef,
      errMsg: `${variableDisplayNameWithCapital} must be in the correct format DD/MM/YYYY`,
      subFieldErrorRefs: [`${errRef}-month`],
    });
  }

  if (daysInMonth < Number(day) || Number(day) < 1) {
    errors.push({
      errRef,
      errMsg: `${variableDisplayNameWithCapital} must be in the correct format DD/MM/YYYY`,
      subFieldErrorRefs: [`${errRef}-day`],
    });
  }

  return errors;
};

export const validateAndParseDayMonthYear = ({ day, month, year }: DayMonthYear, { errRef, variableDisplayName }: ValidationOptions): ErrorsOrDate => {
  const validateAllFieldsArePresentErrors = validateAllFieldsArePresent({ day, month, year }, { errRef, variableDisplayName });
  if (validateAllFieldsArePresentErrors.length) {
    return { errors: validateAllFieldsArePresentErrors };
  }

  const validateAllFieldsAreNumbersErrors = validateAllFieldsAreNumbers({ day, month, year }, { errRef, variableDisplayName });
  if (validateAllFieldsAreNumbersErrors.length) {
    return { errors: validateAllFieldsAreNumbersErrors };
  }

  const validateAllFieldsAreValidErrors = validateAllFieldsAreValid({ day, month, year }, { errRef, variableDisplayName });
  if (validateAllFieldsAreValidErrors.length) {
    return { errors: validateAllFieldsAreValidErrors };
  }

  return {
    date: startOfDay(
      set(new Date(), {
        year: Number(year),
        month: Number(month) - 1,
        date: Number(day),
      }),
    ),
  };
};

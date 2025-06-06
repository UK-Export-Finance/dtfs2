import { isValid, parseISO } from 'date-fns';
import z from 'zod';
import { DayMonthYearInput, GenericValidationError } from '../types';

type ValueAndFieldRefs = {
  value: string;
  day: string;
  month: string;
  year: string;
};

type ErrorOrDate =
  | {
      error: null;
      parsedDate: Date;
    }
  | {
      error: GenericValidationError;
      parsedDate: undefined;
    };

const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const parseDate = ({ day, month, year }: DayMonthYearInput): Date => {
  /*
   * Calling new Date(`${year}-${month}-${day}`) would parse `2024-02-31` as the 3rd of march (or 2nd depending on the year).
   * However we want to display the 31st of February as invalid to the user and force them to enter a valid date so we instead use date-fns parseISO which treats dates like this as an error.
   */
  const isoDateString = `${year}-${month.length === 1 ? `0${month}` : month}-${day.length === 1 ? `0${day}` : day}`;
  return parseISO(isoDateString);
};

const validateAllFieldsArePresent = ({ day, month, year }: DayMonthYearInput, valueName: string, refs: ValueAndFieldRefs): GenericValidationError | null => {
  const capitalisedValueName = capitalizeFirstLetter(valueName);
  const dateIsBlank = !day && !month && !year;

  if (dateIsBlank) {
    return {
      message: `Enter the ${valueName}`,
      ref: refs.value,
      fieldRefs: [refs.day, refs.month, refs.year],
    };
  }

  const dateIsPartiallyBlank = !day || !month || !year;

  if (dateIsPartiallyBlank) {
    if (!day && !month) {
      return {
        message: `${capitalisedValueName} must include a day and a month`,
        ref: refs.value,
        fieldRefs: [refs.day, refs.month],
      };
    }
    if (!day && !year) {
      return {
        message: `${capitalisedValueName} must include a day and a year`,
        ref: refs.value,
        fieldRefs: [refs.day, refs.year],
      };
    }
    if (!month && !year) {
      return {
        message: `${capitalisedValueName} must include a month and a year`,
        ref: refs.value,
        fieldRefs: [refs.month, refs.year],
      };
    }
    if (!day)
      return {
        message: `${capitalisedValueName} must include a day`,
        ref: refs.value,
        fieldRefs: [refs.day],
      };
  }
  if (!month) {
    return {
      message: `${capitalisedValueName} must include a month`,
      ref: refs.value,
      fieldRefs: [refs.month],
    };
  }
  if (!year) {
    return {
      message: `${capitalisedValueName} must include a year`,
      ref: refs.value,
      fieldRefs: [refs.year],
    };
  }
  return null;
};

/**
 * Validates that the provided day, month, and year fields form a valid date.
 * Ensures that each field adheres to specific formatting rules:
 * - `year` must be a 4-digit number.
 * - `month` must be an integer between 1 and 12 (leading zeros allowed).
 * - `day` must be an integer between 1 and 31 (leading zeros allowed).
 *
 * If any of the fields fail validation, an error object is returned containing:
 * - A descriptive error message.
 * - A reference to the invalid value.
 * - References to the specific fields that failed validation.
 *
 * @param {DayMonthYearInput} param0 - An object containing the `day`, `month`, and `year` fields to validate.
 * @param {string} valueName - The name of the value being validated, used in the error message.
 * @param {ValueAndFieldRefs} refs - References to the value and individual fields for error reporting.
 * @returns {GenericValidationError | null} - Returns a validation error object if validation fails, or `null` if all fields are valid.
 */
const validateEachFieldIsValid = ({ day, month, year }: DayMonthYearInput, valueName: string, refs: ValueAndFieldRefs): GenericValidationError | null => {
  const capitalisedValueName = capitalizeFirstLetter(valueName);

  // schema to validate that the year is 4 digits long and only numbers
  let yearFormatError;
  const yearFormatSchema = z.string().length(4).regex(/^\d+$/);

  try {
    yearFormatSchema.parse(year);
  } catch {
    yearFormatError = true;
  }

  // schema which ensures that the month is an integer between 1 and 12 (allows for leading 0s)
  let monthFormatError;
  const monthFormatSchema = z.string().regex(/^([1-9]|1[012]|0[1-9])$/);

  try {
    monthFormatSchema.parse(month);
  } catch {
    monthFormatError = true;
  }

  // schema which ensures that the day is an integer between 1 and 31 (allows for leading 0s)
  let dayFormatError;
  const dayFormatSchema = z.string().regex(/^(3[01]|[12][0-9]|[1-9]|0[1-9])$/);

  try {
    dayFormatSchema.parse(day);
  } catch {
    dayFormatError = true;
  }

  const message = `${capitalisedValueName} must be a real date`;
  const ref = refs.value;
  const fieldRefs: Array<string> = [];

  if (dayFormatError) {
    fieldRefs.push(refs.day);
  }

  if (monthFormatError) {
    fieldRefs.push(refs.month);
  }

  if (yearFormatError) {
    fieldRefs.push(refs.year);
  }

  if (dayFormatError || monthFormatError || yearFormatError) {
    return {
      message,
      ref,
      fieldRefs,
    };
  }

  return null;
};

/**
 * Note: Only one error message (the highest priority one) should be displayed at a time for date fields.
 * The below function only deals with standard date field errors (such as fields left blank, or impossible values entered).
 * It returns the highest priority of these errors as outlined here: https://design-system.service.gov.uk/components/date-input/.
 * All other date field error checks should be added to your custom date function (such as if you need the date in the future / past etc.).
 * The error returned by the below function should always take priority over any additional custom added checks.
 * In some cases, only specific fields in the date input should be highlighted as containing errors. These fields are returned by errRefs.
 *
 * @param inputtedDate - Object containing the values inputted in the 'day', 'month' and 'year' fields
 * @param valueName - the readable name of the field e.g. 'cover end date'. This should be capitalised as you would expect it to appear mid-sentence (typically all lower case).
 * @param valueRef - the internally used ref for the field e.g. 'coverEndDate'
 * @returns errRefs and errMsg. errRefs are the refs of fields that should be highlighted.
 * If errRefs includes 'valueRef' then all 3 date fields should be highlighted.
 */

export const applyStandardValidationAndParseDateInput = (inputtedDate: DayMonthYearInput, valueName: string, valueRef: string): ErrorOrDate => {
  const valueAndFieldRefs = {
    value: valueRef,
    day: `${valueRef}-day`,
    month: `${valueRef}-month`,
    year: `${valueRef}-year`,
  };

  const trimmedInputtedDay = inputtedDate.day?.trim() || '';
  const trimmedInputtedMonth = inputtedDate.month?.trim() || '';
  const trimmedInputtedYear = inputtedDate.year?.trim() || '';
  const trimmedInputtedDate = { day: trimmedInputtedDay, month: trimmedInputtedMonth, year: trimmedInputtedYear };

  const allFieldsPresentError = validateAllFieldsArePresent(trimmedInputtedDate, valueName, valueAndFieldRefs);

  if (allFieldsPresentError) {
    return { error: allFieldsPresentError, parsedDate: undefined };
  }

  const eachFieldValidError = validateEachFieldIsValid(trimmedInputtedDate, valueName, valueAndFieldRefs);

  if (eachFieldValidError) {
    return { error: eachFieldValidError, parsedDate: undefined };
  }

  const parsedDate = parseDate(trimmedInputtedDate);
  const capitalisedValueName = capitalizeFirstLetter(valueName);

  if (!isValid(parsedDate)) {
    return {
      error: {
        message: `${capitalisedValueName} must be a real date`,
        ref: valueAndFieldRefs.value,
        fieldRefs: [valueAndFieldRefs.day, valueAndFieldRefs.month, valueAndFieldRefs.year],
      },
      parsedDate: undefined,
    };
  }

  return {
    error: null,
    parsedDate,
  };
};

/**
 * checks if provided value is a date and is not invalid
 * @param date - provided date
 * @returns if the provided date is an instance of Date and is not invalid
 */
export const isValidDate = (date: any): boolean => date instanceof Date && !Number.isNaN(date.getTime());

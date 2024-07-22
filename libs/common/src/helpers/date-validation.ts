// eslint-disable-next-line import/no-extraneous-dependencies
import Joi from 'joi';
import { set } from 'date-fns';

/**
 * Note: Only one error message (the highest priority one) should be displayed at a time for date fields.
 * The below function only deals with standard date field errors (such as fields left blank, or impossible values entered).
 * It returns the highest priority of these errors as outlined here: https://design-system.service.gov.uk/components/date-input/.
 * All other date field error checks should be added to your custom date function (such as if you need the date in the future / past etc.).
 * The error returned by the below function should always take priority over any additional custom added checks.
 * In some cases, only specific fields in the date input should be highlighted as containing errors. These fields are returned by errRefs.
 *
 * @param valueName - the readable name of the field e.g. 'Cover end date'
 * @param valueRef - the internally used ref for the field e.g. 'coverEndDate'
 * @param inputtedDay - the value inputted in the 'day' field
 * @param inputtedMonth - the value inputted in the 'month' field
 * @param inputtedYear - the value inputted in the 'year' field
 * @returns {Object} containing errRefs and errMsg. errRefs are the refs of fields that should be highlighted.
 * If errRefs includes 'valueRef' then all 3 date fields should be highlighted.
 */

export const getHighestPriorityStandardDateErrorMessage = (
  valueName: string,
  valueRef: string,
  inputtedDay: string | null,
  inputtedMonth: string | null,
  inputtedYear: string | null,
) => {
  const dayFieldRef = `${valueRef}Day`;
  const monthFieldRef = `${valueRef}Month`;
  const yearFieldRef = `${valueRef}Year`;

  if (!inputtedDay || !inputtedMonth || !inputtedYear) {
    if (!inputtedDay && !inputtedMonth && !inputtedYear) {
      return {
        errRefs: [valueRef],
        errMsg: `Enter the ${valueName}`,
      };
    }
    if (!inputtedDay && !inputtedMonth) {
      return {
        errRefs: [dayFieldRef, monthFieldRef],
        errMsg: `${valueName} must include a day and a month`,
      };
    }
    if (!inputtedDay && !inputtedYear) {
      return {
        errRefs: [dayFieldRef, yearFieldRef],
        errMsg: `${valueName} must include a day and a year`,
      };
    }
    if (!inputtedMonth && !inputtedYear) {
      return {
        errRefs: [monthFieldRef, yearFieldRef],
        errMsg: `${valueName} must include a month and a year`,
      };
    }
    if (!inputtedDay)
      return {
        errRefs: [dayFieldRef],
        errMsg: `${valueName} must include a day`,
      };
  }
  if (!inputtedMonth) {
    return {
      errRefs: [monthFieldRef],
      errMsg: `${valueName} must include a month`,
    };
  }
  if (!inputtedYear) {
    return {
      errRefs: [yearFieldRef],
      errMsg: `${valueName} must include a year`,
    };
  }

  // schema to validate that the year is 4 digits long and only numbers
  const yearFormatSchema = Joi.string().length(4).pattern(/^\d+$/).required();
  const yearFormatValidation = yearFormatSchema.validate(inputtedYear.toString());

  // schema which ensures that the month is an integer between 1 and 12 (allows for leading 0s)
  const monthSchema = Joi.string().pattern(/^([1-9]|1[012]|0[1-9])$/);
  const monthFormatValidation = monthSchema.validate(inputtedMonth.toString());

  // schema which ensures that the day is an integer between 1 and 31 (allows for leading 0s)
  const daySchema = Joi.string().pattern(/^(3[01]|[12][0-9]|[1-9]|0[1-9])$/);
  const dayFormatValidation = daySchema.validate(inputtedDay.toString());

  if (dayFormatValidation.error || monthFormatValidation.error || yearFormatValidation.error) {
    if (
      (dayFormatValidation.error && (monthFormatValidation.error || yearFormatValidation.error)) ||
      (monthFormatValidation.error && yearFormatValidation.error)
    ) {
      return {
        errRefs: [valueRef],
        errMsg: `${valueName} must be a real date`,
      };
    }
    if (dayFormatValidation.error) {
      return {
        errRefs: [dayFieldRef],
        errMsg: `${valueName} must be a real date`,
      };
    }
    if (monthFormatValidation.error)
      return {
        errRefs: [monthFieldRef],
        errMsg: `${valueName} must be a real date`,
      };
  }
  if (yearFormatValidation.error) {
    return {
      errRefs: [yearFieldRef],
      errMsg: `${valueName} must be a real date`,
    };
  }
  try {
    set(new Date(), {
      year: Number(inputtedYear),
      month: Number(inputtedMonth) - 1,
      date: Number(inputtedDay),
    });
  } catch {
    return {
      errRefs: [valueRef],
      errMsg: `${valueName} must be a real date`,
    };
  }
  return null;
};

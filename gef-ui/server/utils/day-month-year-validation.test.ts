import { parseISO } from 'date-fns';
import { validateAndParseDayMonthYear } from './day-month-year-validation';

describe('validateAndParseDayMonthYear', () => {
  const errRef = 'test';
  const variableDisplayName = 'test date';

  const invalidDateCases = [
    {
      description: 'returns error if no values given',
      dayMonthYear: { day: '', month: '', year: '' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Enter a test date',
          subFieldErrorRefs: [`${errRef}-day`, `${errRef}-month`, `${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if no day given',
      dayMonthYear: { day: '', month: '12', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a day',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
    {
      description: 'returns error if no month given',
      dayMonthYear: { day: '12', month: '', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a month',
          subFieldErrorRefs: [`${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if no year given',
      dayMonthYear: { day: '12', month: '12', year: '' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a year',
          subFieldErrorRefs: [`${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if no day and month given',
      dayMonthYear: { day: '', month: '', year: '2023' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a day and month',
          subFieldErrorRefs: [`${errRef}-day`, `${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if no day and year given',
      dayMonthYear: { day: '', month: '12', year: '' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a day and year',
          subFieldErrorRefs: [`${errRef}-day`, `${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if no month and year given',
      dayMonthYear: { day: '12', month: '', year: '' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must include a month and year',
          subFieldErrorRefs: [`${errRef}-month`, `${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if day has more than 2 digits',
      dayMonthYear: { day: '333', month: '12', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The day for the test date must include 1 or 2 numbers',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
      expectedSubFieldErrorRefs: [`${errRef}-day`],
    },
    {
      description: 'returns error if month has more than 2 digits',
      dayMonthYear: { day: '33', month: '122', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The month for the test date must include 1 or 2 numbers',
          subFieldErrorRefs: [`${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if year has more than 4 digits',
      dayMonthYear: { day: '33', month: '12', year: '20245' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The year for the test date must include 4 numbers',
          subFieldErrorRefs: [`${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if year has less than 4 digits',
      dayMonthYear: { day: '33', month: '12', year: '202' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The year for the test date must include 4 numbers',
          subFieldErrorRefs: [`${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if day contains a non-numeric character',
      dayMonthYear: { day: '3a', month: '12', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The day for the test date must include 1 or 2 numbers',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
    {
      description: 'returns error if month contains a non-numeric character',
      dayMonthYear: { day: '33', month: '1a', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The month for the test date must include 1 or 2 numbers',
          subFieldErrorRefs: [`${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if year contains a non-numeric character',
      dayMonthYear: { day: '33', month: '12', year: '202a' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'The year for the test date must include 4 numbers',
          subFieldErrorRefs: [`${errRef}-year`],
        },
      ],
    },
    {
      description: 'returns error if month is greater than 12',
      dayMonthYear: { day: '1', month: '13', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if month is less than 1',
      dayMonthYear: { day: '1', month: '0', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-month`],
        },
      ],
    },
    {
      description: 'returns error if day is less than 1',
      dayMonthYear: { day: '0', month: '12', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
    {
      description: 'returns error if day is greater than days in month',
      dayMonthYear: { day: '32', month: '12', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
    {
      description: 'returns error if day is greater than days in month in february',
      dayMonthYear: { day: '29', month: '2', year: '2023' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
    {
      description: 'returns error if day is greater than days in month in february in leap year',
      dayMonthYear: { day: '30', month: '2', year: '2024' },
      expectedErrors: [
        {
          errRef,
          errMsg: 'Test date must be in the correct format DD/MM/YYYY',
          subFieldErrorRefs: [`${errRef}-day`],
        },
      ],
    },
  ];

  const validDateCases = [
    {
      description: 'Accepts 1st January',
      dayMonthYear: { day: '1', month: '1', year: '2024' },
      expectedDate: parseISO('2024-01-01T00:00:00.000Z'),
    },
    {
      description: 'Accepts 31st December',
      dayMonthYear: { day: '31', month: '12', year: '2024' },
      expectedDate: parseISO('2024-12-31T00:00:00.000Z'),
    },
    {
      description: 'Accepts 28th February',
      dayMonthYear: { day: '28', month: '2', year: '2023' },
      expectedDate: parseISO('2023-02-28T00:00:00.000Z'),
    },
    {
      description: 'Accepts 29th February in a leap year',
      dayMonthYear: { day: '29', month: '2', year: '2024' },
      expectedDate: parseISO('2024-02-29T00:00:00.000Z'),
    },
  ];

  it.each(invalidDateCases)('$description', ({ dayMonthYear, expectedErrors }) => {
    const result = validateAndParseDayMonthYear(dayMonthYear, { errRef, variableDisplayName });

    expect(result).toEqual({
      errors: expectedErrors,
    });
  });

  it.each(validDateCases)('$description', ({ dayMonthYear, expectedDate }) => {
    const result = validateAndParseDayMonthYear(dayMonthYear, { errRef, variableDisplayName });

    expect(result).toEqual({
      date: expectedDate,
    });
  });
});

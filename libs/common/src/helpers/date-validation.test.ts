import { applyStandardValidationAndParseDateInput, isDate } from './date-validation';

describe('date-validation helpers', () => {
  describe('applyStandardValidationAndParseDateInput', () => {
    const errorTestCases = [
      {
        description: 'Missing all values',
        day: '',
        month: '',
        year: '',
        expectedErrorMessage: 'Enter the test name',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
      {
        description: 'Missing day and month',
        day: '',
        month: '',
        year: '2023',
        expectedErrorMessage: 'Test name must include a day and a month',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month'],
      },
      {
        description: 'Missing day and year',
        day: '',
        month: '12',
        year: '',
        expectedErrorMessage: 'Test name must include a day and a year',
        expectedFieldRefs: ['test-ref-day', 'test-ref-year'],
      },
      {
        description: 'Missing month and year',
        day: '12',
        month: '',
        year: '',
        expectedErrorMessage: 'Test name must include a month and a year',
        expectedFieldRefs: ['test-ref-month', 'test-ref-year'],
      },
      {
        description: 'Missing day',
        day: '',
        month: '12',
        year: '2023',
        expectedErrorMessage: 'Test name must include a day',
        expectedFieldRefs: ['test-ref-day'],
      },
      {
        description: 'Missing month',
        day: '12',
        month: '',
        year: '2023',
        expectedErrorMessage: 'Test name must include a month',
        expectedFieldRefs: ['test-ref-month'],
      },
      {
        description: 'Missing year',
        day: '12',
        month: '12',
        year: '',
        expectedErrorMessage: 'Test name must include a year',
        expectedFieldRefs: ['test-ref-year'],
      },
      {
        description: 'Incorrect day format, non-existent day',
        day: '32',
        month: '12',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day'],
      },
      {
        description: 'Incorrect day format, string',
        day: '/.$',
        month: '12',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day'],
      },
      {
        description: 'Incorrect day format, 0',
        day: '0',
        month: '12',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day'],
      },
      {
        description: 'Incorrect month format, string',
        day: '12',
        month: 's',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-month'],
      },
      {
        description: 'Incorrect month format, 0',
        day: '12',
        month: '0',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-month'],
      },
      {
        description: 'Incorrect month format, non-existent month',
        day: '12',
        month: '13',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-month'],
      },
      {
        description: 'Incorrect year format, string',
        day: '12',
        month: '12',
        year: 'asdf',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-year'],
      },
      {
        description: 'Incorrect year format, length',
        day: '12',
        month: '12',
        year: '12345',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-year'],
      },
      {
        description: 'Incorrect year format, string',
        day: '12',
        month: '12',
        year: 'asdf',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-year'],
      },
      {
        description: 'All fields formatted incorrectly',
        day: '123',
        month: 'sdf',
        year: '12345',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
      {
        description: 'Two fields formatted incorrectly',
        day: '123',
        month: '11',
        year: '202',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
      {
        description: 'Missing field and incorrectly formatted field',
        day: '',
        month: '11',
        year: '202',
        expectedErrorMessage: 'Test name must include a day',
        expectedFieldRefs: ['test-ref-day'],
      },
      {
        description: 'Two missing fields and incorrectly formatted field',
        day: '',
        month: '',
        year: '202',
        expectedErrorMessage: 'Test name must include a day and a month',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month'],
      },
      {
        description: '30th Feb',
        day: '30',
        month: '2',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
      {
        description: '31st Sep',
        day: '31',
        month: '09',
        year: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
      {
        description: '29th Feb 2025',
        day: '29',
        month: '02',
        year: '2025',
        expectedErrorMessage: 'Test name must be a real date',
        expectedFieldRefs: ['test-ref-day', 'test-ref-month', 'test-ref-year'],
      },
    ];

    it.each(errorTestCases)('$description gives the correct error message', ({ day, month, year, expectedErrorMessage, expectedFieldRefs }) => {
      const result = applyStandardValidationAndParseDateInput({ day, month, year }, 'test name', 'test-ref');

      expect(result.error).toEqual({ message: expectedErrorMessage, ref: 'test-ref', fieldRefs: expectedFieldRefs });
    });

    const correctTestCases = [
      {
        description: 'Correct date in future',
        day: '12',
        month: '12',
        year: '2050',
        expectedParsedDate: new Date('2050-12-12T00:00:00.0000'),
      },
      {
        description: 'Correct date with leading and trailing white space',
        day: ' 12 ',
        month: ' 12  ',
        year: ' 2050  ',
        expectedParsedDate: new Date('2050-12-12T00:00:00.0000'),
      },
      {
        description: 'Correct date leading 0s',
        day: '05',
        month: '07',
        year: '2050',
        expectedParsedDate: new Date('2050-07-05T00:00:00.0000'),
      },
      {
        description: 'Correct date in past',
        day: '1',
        month: '1',
        year: '1995',
        expectedParsedDate: new Date('1995-01-01T00:00:00.0000'),
      },
      {
        description: '29th Feb 2024',
        day: '29',
        month: '02',
        year: '2024',
        expectedParsedDate: new Date('2024-02-29T00:00:00.0000'),
      },
    ];

    it.each(correctTestCases)('$description returns no error and a correctly parsed date', ({ day, month, year, expectedParsedDate }) => {
      const result = applyStandardValidationAndParseDateInput({ day, month, year }, 'test name', 'test-ref');

      expect(result).toEqual({ error: null, parsedDate: expectedParsedDate });
    });
  });

  describe('isDate', () => {
    describe('when date is valid', () => {
      it('should return true', () => {
        const result = isDate(new Date());
        expect(result).toEqual(true);
      });
    });

    describe('when date is invalid', () => {
      it('should return false', () => {
        const result = isDate('invalid date');
        expect(result).toEqual(false);
      });
    });

    describe('when date is null', () => {
      it('should return false', () => {
        const result = isDate(null);
        expect(result).toEqual(false);
      });
    });
  });
});

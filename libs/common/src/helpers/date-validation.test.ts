import { getHighestPriorityStandardDateErrorMessage } from './date-validation';

describe('date-validation helpers', () => {
  describe('getHighestPriorityStandardDateErrorMessage', () => {
    const errorTestCases = [
      {
        description: 'Missing all values',
        inputtedDay: null,
        inputtedMonth: null,
        inputtedYear: null,
        expectedErrorMessage: 'Enter the Test name',
        expectedErrorRefs: ['testRef'],
      },
      {
        description: 'Missing day and month',
        inputtedDay: null,
        inputtedMonth: null,
        inputtedYear: '2023',
        expectedErrorMessage: 'Test name must include a day and a month',
        expectedErrorRefs: ['testRefDay', 'testRefMonth'],
      },
      {
        description: 'Missing day and year',
        inputtedDay: null,
        inputtedMonth: '12',
        inputtedYear: null,
        expectedErrorMessage: 'Test name must include a day and a year',
        expectedErrorRefs: ['testRefDay', 'testRefYear'],
      },
      {
        description: 'Missing month and year',
        inputtedDay: '12',
        inputtedMonth: null,
        inputtedYear: null,
        expectedErrorMessage: 'Test name must include a month and a year',
        expectedErrorRefs: ['testRefMonth', 'testRefYear'],
      },
      {
        description: 'Missing day',
        inputtedDay: null,
        inputtedMonth: '12',
        inputtedYear: '2023',
        expectedErrorMessage: 'Test name must include a day',
        expectedErrorRefs: ['testRefDay'],
      },
      {
        description: 'Missing month',
        inputtedDay: '12',
        inputtedMonth: null,
        inputtedYear: '2023',
        expectedErrorMessage: 'Test name must include a month',
        expectedErrorRefs: ['testRefMonth'],
      },
      {
        description: 'Missing year',
        inputtedDay: '12',
        inputtedMonth: '12',
        inputtedYear: null,
        expectedErrorMessage: 'Test name must include a year',
        expectedErrorRefs: ['testRefYear'],
      },
      {
        description: 'Incorrect day format, non-existent day',
        inputtedDay: '32',
        inputtedMonth: '12',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefDay'],
      },
      {
        description: 'Incorrect day format, string',
        inputtedDay: '/.$',
        inputtedMonth: '12',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefDay'],
      },
      {
        description: 'Incorrect day format, 0',
        inputtedDay: '0',
        inputtedMonth: '12',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefDay'],
      },
      {
        description: 'Incorrect month format, string',
        inputtedDay: '12',
        inputtedMonth: 's',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefMonth'],
      },
      {
        description: 'Incorrect month format, 0',
        inputtedDay: '12',
        inputtedMonth: '0',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefMonth'],
      },
      {
        description: 'Incorrect month format, non-existent month',
        inputtedDay: '12',
        inputtedMonth: '13',
        inputtedYear: '2024',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefMonth'],
      },
      {
        description: 'Incorrect year format, string',
        inputtedDay: '12',
        inputtedMonth: '12',
        inputtedYear: 'asdf',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefYear'],
      },
      {
        description: 'Incorrect year format, length',
        inputtedDay: '12',
        inputtedMonth: '12',
        inputtedYear: '12345',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefYear'],
      },
      {
        description: 'Incorrect year format, string',
        inputtedDay: '12',
        inputtedMonth: '12',
        inputtedYear: 'asdf',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRefYear'],
      },
      {
        description: 'All fields formatted incorrectly',
        inputtedDay: '123',
        inputtedMonth: 'sdf',
        inputtedYear: '12345',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRef'],
      },
      {
        description: 'Two fields formatted incorrectly',
        inputtedDay: '123',
        inputtedMonth: '11',
        inputtedYear: '202',
        expectedErrorMessage: 'Test name must be a real date',
        expectedErrorRefs: ['testRef'],
      },
      {
        description: 'Missing field and incorrectly formatted field',
        inputtedDay: null,
        inputtedMonth: '11',
        inputtedYear: '202',
        expectedErrorMessage: 'Test name must include a day',
        expectedErrorRefs: ['testRefDay'],
      },
      {
        description: 'Two missing fields and incorrectly formatted field',
        inputtedDay: null,
        inputtedMonth: null,
        inputtedYear: '202',
        expectedErrorMessage: 'Test name must include a day and a month',
        expectedErrorRefs: ['testRefDay', 'testRefMonth'],
      },
    ];

    it.each(errorTestCases)(
      '$description gives the correct error message',
      ({ inputtedDay, inputtedMonth, inputtedYear, expectedErrorMessage, expectedErrorRefs }) => {
        const result = getHighestPriorityStandardDateErrorMessage('Test name', 'testRef', inputtedDay, inputtedMonth, inputtedYear);

        expect(result).toEqual({ errRefs: expectedErrorRefs, errMsg: expectedErrorMessage });
      },
    );

    const correctTestCases = [
      {
        description: 'Correct date in future',
        inputtedDay: '12',
        inputtedMonth: '12',
        inputtedYear: '2050',
      },
      {
        description: 'Correct date leading 0s',
        inputtedDay: '05',
        inputtedMonth: '07',
        inputtedYear: '2050',
      },
      {
        description: 'Correct date in past',
        inputtedDay: '1',
        inputtedMonth: '1',
        inputtedYear: '1995',
      },
    ];

    it.each(correctTestCases)('$description returns no error', ({ inputtedDay, inputtedMonth, inputtedYear }) => {
      const result = getHighestPriorityStandardDateErrorMessage('Test name', 'testRef', inputtedDay, inputtedMonth, inputtedYear);

      expect(result).toEqual(null);
    });
  });
});

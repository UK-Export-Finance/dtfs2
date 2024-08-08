import { formatIsoDateString } from './filter-formatIsoDateString';

describe('nunjuck filters - formatIsoDateString', () => {
  const testCases = [
    {
      description: 'should return correct date when formatting to `dd/MM/yyyy`',
      mockDate: new Date('2024-07-3').toISOString(),
      toFormat: 'dd/MM/yyyy',
      expected: '03/07/2024',
    },
    {
      description: 'should return correct date when formatting to `dd MMMM yyyy`',
      mockDate: new Date('2025-01-1').toISOString(),
      toFormat: 'dd MMMM yyyy',
      expected: '01 January 2025',
    },
    {
      description: 'formats to `d MMM yyyy` when toFormat is not given',
      mockDate: new Date('2023-01-03').toISOString(),
      expected: '3 Jan 2023',
    },
    {
      description: 'should return `Invalid date` when date is invalid',
      mockDate: '12/12/2023',
      toFormat: 'dd/MM/yyyy',
      expected: 'Invalid date',
    },
  ];

  it.each(testCases)('$description', ({ mockDate, toFormat, expected }) => {
    const result = formatIsoDateString(mockDate, toFormat);

    expect(result).toEqual(expected);
  });
});

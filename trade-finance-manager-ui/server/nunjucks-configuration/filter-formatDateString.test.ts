import { formatDateString } from './filter-formatDateString';

describe('nunjuck filters - formatDateString', () => {
  const testCases = [
    {
      description: 'should return correct date when formatting from `dd-MM-yyyy` to `dd/MM/yyyy`',
      mockDate: '14-01-2023',
      fromFormat: 'dd-MM-yyyy',
      toFormat: 'dd/MM/yyyy',
      expected: '14/01/2023',
    },
    {
      description: 'should return correct date when formatting from `d M yy` to `dd/MM/yyyy`',
      mockDate: '4 2 24',
      fromFormat: 'd M yy',
      toFormat: 'dd/MM/yyyy',
      expected: '04/02/2024',
    },
    {
      description: 'should return correct date when formatting from `do MMMM yyyy HH:mm` to `dd/MM/yyyy h:mmaaa`',
      mockDate: '5th January 2021 15:01',
      fromFormat: 'do MMMM yyyy HH:mm',
      toFormat: 'dd/MM/yyyy h:mmaaa',
      expected: '05/01/2021 3:01pm',
    },
    {
      description: 'formats to `d MMM yyyy` when toFormat is not given',
      mockDate: '03-01-2023',
      fromFormat: 'dd-MM-yyyy',
      expected: '3 Jan 2023',
    },
    {
      description: 'should return `Invalid date` when date is invalid',
      mockDate: '##/##/####',
      fromFormat: 'dd-MM-yyyy',
      toFormat: 'dd/MM/yyyy',
      expected: 'Invalid date',
    },
    {
      description: 'returns `Invalid date` when date string is invalid and toFormat is not given',
      mockDate: '##/##/####',
      fromFormat: 'dd/MM/yyyy',
      expected: 'Invalid date',
    },
  ];

  it.each(testCases)('$description', ({ mockDate, fromFormat, toFormat, expected }) => {
    const result = formatDateString(mockDate, fromFormat, toFormat);

    expect(result).toEqual(expected);
  });
});

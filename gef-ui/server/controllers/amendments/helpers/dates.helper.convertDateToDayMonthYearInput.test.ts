import { DayMonthYearInput } from '@ukef/dtfs2-common';
import { convertDateToDayMonthYearInput } from './dates.helper.ts';

describe('convertDateToDayMonthYearInput', () => {
  const testCases: { description: string; date: Date; expected: DayMonthYearInput }[] = [
    {
      description: 'single digit day',
      date: new Date('2021-11-01'),
      expected: { day: '1', month: '11', year: '2021' },
    },
    {
      description: 'single digit month',
      date: new Date('2019-04-29'),
      expected: { day: '29', month: '4', year: '2019' },
    },
    {
      description: 'single digit day and month',
      date: new Date('2026-06-09'),
      expected: { day: '9', month: '6', year: '2026' },
    },
    {
      description: '01/01/1970',
      date: new Date('1970-01-01'),
      expected: { day: '1', month: '1', year: '1970' },
    },
    {
      description: '9999 year',
      date: new Date('9999-12-31'),
      expected: { day: '31', month: '12', year: '9999' },
    },
  ];

  describe.each(testCases)('$description', ({ date, expected }: { date: Date; expected: DayMonthYearInput }) => {
    it('should return the correct DayMonthYearInput object', () => {
      expect(convertDateToDayMonthYearInput(date)).toEqual(expected);
    });
  });
});

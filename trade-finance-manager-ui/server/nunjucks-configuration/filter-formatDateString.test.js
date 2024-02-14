import { format } from 'date-fns';
import formatDateString from './filter-formatDateString';

describe('nunjuck filters - formatDateString', () => {
  it('should return formatted date from existing formatted date', () => {
    const fromFormat = {
      moment: 'DD-MM-YYYY',
      'date-fns': 'dd-MM-yyyy',
    };
    const date = new Date();
    const mockDate = format(date, fromFormat['date-fns']);

    const toFormat = {
      moment: 'DD/MM/YYYY',
      'date-fns': 'dd/MM/yyyy',
    };

    const result = formatDateString(mockDate, fromFormat.moment, toFormat.moment);

    const expected = format(date, toFormat['date-fns']);
    expect(result).toEqual(expected);
  });
});

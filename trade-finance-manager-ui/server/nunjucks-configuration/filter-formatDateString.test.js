import moment from 'moment';
import formatDateString from './filter-formatDateString';

describe('nunjuck filters - formatDateString', () => {
  it('should return formatted date from existing formatted date', () => {
    const fromFormat = 'DD-MM-YYYY';
    const mockDate = moment().format(fromFormat);

    const toFormat = 'DD/MM/YYYY';

    const result = formatDateString(mockDate, fromFormat, toFormat);

    const expected = moment(mockDate, fromFormat).format(toFormat);
    expect(result).toEqual(expected);
  });
});

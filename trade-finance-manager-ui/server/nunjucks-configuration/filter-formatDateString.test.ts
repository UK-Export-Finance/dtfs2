import moment from 'moment';
import { filterFormatDateString } from './filter-formatDateString';

describe('nunjuck filters - formatDateString', () => {
  it('should return formatted date from existing formatted date', () => {
    const fromFormat = 'dd-MM-yyyy';

    const mockDate = moment().format(fromFormat);

    const toFormat = 'dd/MM/yyyy';

    const result = filterFormatDateString(mockDate, fromFormat, toFormat);

    const expected = moment(mockDate, fromFormat).format(toFormat);
    expect(result).toEqual(expected);
  });
});

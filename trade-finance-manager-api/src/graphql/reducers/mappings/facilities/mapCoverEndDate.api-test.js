const moment = require('moment');
const mapCoverEndDate = require('./mapCoverEndDate');
const { formatYear } = require('../../../../utils/date');

describe('mapCoverEndDate', () => {
  it('should return formatted cover end date', () => {
    const mockCoverEndDate = {
      day: '01',
      month: '02',
      year: '2021',
    };

    const { day, month, year } = mockCoverEndDate;

    const result = mapCoverEndDate(day, month, year);

    const coverEndDate = moment().set({
      date: Number(day),
      month: Number(month) - 1, // months are zero indexed
      year: Number(year),
    });

    const expected = moment(coverEndDate).format('D MMMM YYYY');

    expect(result).toEqual(expected);
  });

  describe('when cover end date year only has 2 digits', () => {
    it('should return 4 digit year', () => {
      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = mapCoverEndDate(day, month, year);

      const coverEndDate = moment().set({
        date: Number(day),
        month: Number(month) - 1, // months are zero indexed
        year: formatYear(Number(year)),
      });

      const expected = moment(coverEndDate).format('D MMMM YYYY');
      expect(result).toEqual(expected);

      const yearResult = moment(coverEndDate).format('YYYY');
      expect(yearResult).toEqual('2021');
    });
  });

  describe('when cover end date is invalid', () => {
    it('should return 4 digit year', () => {
      const mockCoverEndDate = {
        day: 'Invalid Date',
        month: 'Invalid Date',
        year: 'Invalid Date',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = mapCoverEndDate(day, month, year);

      expect(result).toEqual(undefined);
    });
  });
});

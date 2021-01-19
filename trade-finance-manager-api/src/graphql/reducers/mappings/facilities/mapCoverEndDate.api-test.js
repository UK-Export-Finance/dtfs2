const moment = require('moment');
const mapCoverEndDate = require('./mapCoverEndDate');
const { formatYear } = require('../../../../utils/date');

describe('mapCoverEndDate', () => {
  it('should return formatted cover end date', () => {
    const mockCoverEndDate = {
      'coverEndDate-day': '01',
      'coverEndDate-month': '02',
      'coverEndDate-year': '2021',
    };

    const {
      'coverEndDate-day': coverEndDateDay,
      'coverEndDate-month': coverEndDateMonth,
      'coverEndDate-year': coverEndDateYear,
    } = mockCoverEndDate;

    const result = mapCoverEndDate({ ...mockCoverEndDate });

    const coverEndDate = moment().set({
      date: Number(coverEndDateDay),
      month: Number(coverEndDateMonth) - 1, // months are zero indexed
      year: Number(coverEndDateYear),
    });

    const expected = moment(coverEndDate).format('D MMM YYYY');

    expect(result).toEqual(expected);
  });

  describe('when cover end date year only has 2 digits', () => {
    it('should return 4 digit year', () => {
      const mockCoverEndDate = {
        'coverEndDate-day': '01',
        'coverEndDate-month': '02',
        'coverEndDate-year': '21',
      };

      const {
        'coverEndDate-day': coverEndDateDay,
        'coverEndDate-month': coverEndDateMonth,
        'coverEndDate-year': coverEndDateYear,
      } = mockCoverEndDate;

      const result = mapCoverEndDate({ ...mockCoverEndDate });

      const coverEndDate = moment().set({
        date: Number(coverEndDateDay),
        month: Number(coverEndDateMonth) - 1, // months are zero indexed
        year: formatYear(Number(coverEndDateYear)),
      });

      const expected = moment(coverEndDate).format('D MMM YYYY');
      expect(result).toEqual(expected);

      const year = moment(coverEndDate).format('YYYY');
      expect(year).toEqual('2021');
    });
  });
});

const { format, fromUnixTime, set } = require('date-fns');
const mapCoverEndDate = require('./mapCoverEndDate');
const { formatYear } = require('../../../../utils/date');
const { AMENDMENT_STATUS } = require('../../../../constants/deals');

describe('mapCoverEndDate', () => {
  it('should return formatted cover end date', () => {
    const mockCoverEndDate = {
      day: '01',
      month: '02',
      year: '2021',
    };

    const { day, month, year } = mockCoverEndDate;

    const result = mapCoverEndDate(day, month, year, {});

    const coverEndDate = set(new Date(), {
      date: Number(day),
      month: Number(month) - 1, // months are zero indexed
      year: Number(year),
    });

    const expected = format(coverEndDate, 'd MMMM yyyy');

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

      const result = mapCoverEndDate(day, month, year, {});

      const coverEndDate = set(new Date(), {
        date: Number(day),
        month: Number(month) - 1, // months are zero indexed
        year: formatYear(Number(year)),
      });

      const expected = format(coverEndDate, 'd MMMM yyyy');
      expect(result).toEqual(expected);

      const yearResult = format(coverEndDate, 'yyyy');
      expect(yearResult).toEqual('2021');
    });
  });

  describe('when facility provided but no latest completed amendment', () => {
    it('should return 4 digit year provided', () => {
      const facility = {
        amendments: [
          {
            amendmentId: 5,
            coverEndDate: 1660637831,
          },
        ],
      };

      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = mapCoverEndDate(day, month, year, facility);

      const coverEndDate = set(new Date(), {
        date: Number(day),
        month: Number(month) - 1, // months are zero indexed
        year: formatYear(Number(year)),
      });

      const expected = format(coverEndDate, 'd MMMM yyyy');
      expect(result).toEqual(expected);

      const yearResult = format(coverEndDate, 'yyyy');
      expect(yearResult).toEqual('2021');
    });
  });

  describe('when facility provided and latest completed amendment has a coverEndDate', () => {
    it('should return modified coverEndDate', () => {
      const coverEndDateUnix = 1658403289;

      const mockFacility = {
        amendments: [
          {
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: coverEndDateUnix,
            },
          },
        ],
      };

      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = mapCoverEndDate(day, month, year, mockFacility);

      const expected = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');

      expect(result).toEqual(expected);
    });
  });

  describe('when cover end date is null', () => {
    it('should return undefined as date is null', () => {
      const mockCoverEndDate = {
        day: null,
        month: null,
        year: null,
      };

      const { day, month, year } = mockCoverEndDate;

      const result = mapCoverEndDate(day, month, year);

      expect(result).toBeUndefined();
    });
  });
});

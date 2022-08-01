const moment = require('moment');
const { format, fromUnixTime } = require('date-fns');
const mapCoverEndDate = require('./mapCoverEndDate');
const { formatYear } = require('../../../../utils/date');
const api = require('../../../../v1/api');
const { DEALS } = require('../../../../constants');

describe('mapCoverEndDate', () => {
  it('should return formatted cover end date', async () => {
    const mockCoverEndDate = {
      day: '01',
      month: '02',
      year: '2021',
    };

    const { day, month, year } = mockCoverEndDate;

    const result = await mapCoverEndDate(day, month, year);

    const coverEndDate = moment().set({
      date: Number(day),
      month: Number(month) - 1, // months are zero indexed
      year: Number(year),
    });

    const expected = moment(coverEndDate).format('D MMMM YYYY');

    expect(result).toEqual(expected);
  });

  describe('when cover end date year only has 2 digits', () => {
    it('should return 4 digit year', async () => {
      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = await mapCoverEndDate(day, month, year);

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

  describe('when facility provided but no latest completed amendment', () => {
    it('should return 4 digit year provided', async () => {
      api.getLatestCompletedAmendment = () => Promise.resolve({});

      const facilitySnapshot = {
        _id: '123',
      };

      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = await mapCoverEndDate(day, month, year, facilitySnapshot);

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

  describe('when facility provided and latest completed amendment has a coverEndDate', () => {
    it('should return modified coverEndDate', async () => {
      const coverEndDateUnix = 1658403289;

      api.getLatestCompletedAmendment = () => Promise.resolve({
        coverEndDate: coverEndDateUnix,
        amendmentId: '1234',
        bankDecision: {
          submitted: true,
          decision: DEALS.AMENDMENT_BANK_DECISION.PROCEED,
        },
        ukefDecision: {
          submitted: true,
          coverEndDate: DEALS.AMENDMENT_UW_DECISION.APPROVED_WITHOUT_CONDITIONS,
        },
      });

      const facilitySnapshot = {
        _id: '123',
      };

      const mockCoverEndDate = {
        day: '01',
        month: '02',
        year: '21',
      };

      const { day, month, year } = mockCoverEndDate;

      const result = await mapCoverEndDate(day, month, year, facilitySnapshot);

      const expected = format(fromUnixTime(coverEndDateUnix), 'd MMMM yyyy');

      expect(result).toEqual(expected);
    });
  });

  describe('when cover end date is null', () => {
    it('should return undefined as date is null', async () => {
      const mockCoverEndDate = {
        day: null,
        month: null,
        year: null,
      };

      const { day, month, year } = mockCoverEndDate;

      const result = await mapCoverEndDate(day, month, year);

      expect(result).toEqual(undefined);
    });
  });
});

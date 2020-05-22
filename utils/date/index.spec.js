const moment = require('moment');
const { dateIsInTimeframe } = require('.');

describe('utils - date', () => {
  describe('dateIsInTimeframe', () => {
    describe('when a date is within the given timeframe', () => {
      it('should return true', () => {
        const nowDate = moment();
        const day = moment(nowDate).format('DD');
        const month = moment(nowDate).format('MM');
        const year = moment(nowDate).format('YYYY');
        const startDate = moment(nowDate).remove(1, 'day');
        const endDate = moment(nowDate).add(7, 'day');

        const result = dateIsInTimeframe(
          day,
          month,
          year,
          startDate,
          endDate,
        );
        expect(result).toEqual(true);
      });
    });

    describe('when a date is the same as the start of the given timeframe', () => {
      it('should return true', () => {
        const nowDate = moment();
        const day = moment(nowDate).format('DD');
        const month = moment(nowDate).format('MM');
        const year = moment(nowDate).format('YYYY');
        const startDate = nowDate;
        const endDate = moment(nowDate).add(7, 'day');

        const result = dateIsInTimeframe(
          day,
          month,
          year,
          startDate,
          endDate,
        );
        expect(result).toEqual(true);
      });
    });

    describe('when a date is the same as the end of the given timeframe', () => {
      it('should return true', () => {
        const nowDate = moment();
        const day = moment(nowDate).add(7, 'day').format('DD');
        const month = moment(nowDate).add(7, 'day').format('MM');
        const year = moment(nowDate).add(7, 'day').format('YYYY');
        const startDate = nowDate;
        const endDate = moment(nowDate).add(7, 'day');

        const result = dateIsInTimeframe(
          day,
          month,
          year,
          startDate,
          endDate,
        );
        expect(result).toEqual(true);
      });
    });

    describe('when a date is NOT within the given timeframe', () => {
      it('should return false', () => {
        const nowDate = moment();
        const day = moment(nowDate).add(8, 'day').format('DD');
        const month = moment(nowDate).add(8, 'day').format('MM');
        const year = moment(nowDate).add(8, 'day').format('YYYY');
        const startDate = moment(nowDate).remove(1, 'day');
        const endDate = moment(nowDate).add(7, 'day');

        const result = dateIsInTimeframe(
          day,
          month,
          year,
          startDate,
          endDate,
        );
        expect(result).toEqual(false);
      });
    });
  });
});

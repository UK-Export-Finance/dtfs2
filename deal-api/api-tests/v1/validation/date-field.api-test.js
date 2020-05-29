const moment = require('moment');
const {
  dateHasAllValues,
  dateHasSomeValues,
  dateIsInTimeframe,
  dateValidationText,
} = require('../../../src/v1/validation/date-field');

describe('validation - date-field', () => {
  describe('dateHasAllValues', () => {
    it('should return true when day, month and year is provided', () => {
      const result = dateHasAllValues('01', '02', '2020');
      expect(result).toEqual(true);
    });

    it('should return false when day or month or year is missing', () => {
      expect(dateHasAllValues('', '02', '2020')).toEqual(false);
      expect(dateHasAllValues('01', '', '2020')).toEqual(false);
      expect(dateHasAllValues('01', '02', '')).toEqual(false);
      expect(dateHasAllValues('01', '', '')).toEqual(false);
      expect(dateHasAllValues('', '02', '2020')).toEqual(false);
      expect(dateHasAllValues()).toEqual(false);
      expect(dateHasAllValues('', '')).toEqual(false);
      expect(dateHasAllValues('01/02/2020')).toEqual(false);
    });
  });

  describe('dateHasSomeValues', () => {
    it('should return true when only day is provided', () => {
      const result = dateHasSomeValues('01');
      expect(result).toEqual(true);
    });

    it('should return true when only month is provided', () => {
      const result = dateHasSomeValues('', '02');
      expect(result).toEqual(true);
    });

    it('should return true when only year is provided', () => {
      const result = dateHasSomeValues('', '', '2020');
      expect(result).toEqual(true);
    });

    it('should return false when no values provided', () => {
      expect(dateHasSomeValues('', '', '')).toEqual(false);
      expect(dateHasSomeValues()).toEqual(false);
    });
  });

  describe('dateIsInTimeframe', () => {
    describe('when a date is within the given timeframe', () => {
      it('should return true', () => {
        const nowDate = moment();
        const day = moment(nowDate).format('DD');
        const month = moment(nowDate).format('MM');
        const year = moment(nowDate).format('YYYY');
        const startDate = moment(nowDate).subtract(1, 'day');
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
        const startDate = moment(nowDate).subtract(1, 'day');
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

  describe('dateValidationText', () => {
    it('should return the correct string/message depending on which part of the date is missing', () => {
      const mockFieldCopy = 'Field Name';

      let result = dateValidationText(mockFieldCopy, '01', '', '');
      let expected = `${mockFieldCopy} must include month and year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '01', '02', '');
      expected = `${mockFieldCopy} must include a year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '01', '', '2020');
      expected = `${mockFieldCopy} must include a month`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '', '02', '');
      expected = `${mockFieldCopy} must include day and year`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '', '02', '2020');
      expected = `${mockFieldCopy} must include a day`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '', '', '2020');
      expected = `${mockFieldCopy} must include day and month`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy, '', '', '');
      expected = `Enter the ${mockFieldCopy}`;
      expect(result).toEqual(expected);

      result = dateValidationText(mockFieldCopy);
      expected = `Enter the ${mockFieldCopy}`;
      expect(result).toEqual(expected);
    });
  });
});

const moment = require('moment');
const { hasAllCoverEndDateValues, updateCoverEndDate } = require('../../../src/v1/facility-dates/cover-end-date');

describe('hasAllCoverEndDateValues()', () => {
  it('should return true if day, month and year exist', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(true);
  });

  it('should return false if day, month and year don\'t exist', () => {
    const facility = {
      'coverEndDate-day': '',
      'coverEndDate-month': '',
      'coverEndDate-year': '',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it('should return false if the year doesn\'t exist', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it('should return false if the month doesn\'t exist', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '',
      'coverEndDate-year': '2022',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it('should return false if the day doesn\'t exist', () => {
    const facility = {
      'coverEndDate-day': '',
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });
});

describe('updateCoverEndDate', () => {
  it('should return facility.coverEndDate if facility has valid day, month, year', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    const date = moment().set({
      date: Number(facility['coverEndDate-day']),
      month: Number(facility['coverEndDate-month']) - 1, // months are zero indexed
      year: Number(facility['coverEndDate-year']),
    });

    const coverEndDate = moment(date).utc().valueOf().toString();

    // rounded to nearest 100 to account for millisecond mismatch
    expect(Math.round(result.coverEndDate / 100)).toEqual(Math.round(coverEndDate / 100));
  });

  it('should return NaN if invalid day, month and year', () => {
    const facility = {
      'coverEndDate-day': '##',
      'coverEndDate-month': '##',
      'coverEndDate-year': '####',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toEqual('NaN');
  });

  it('should return undefined if null day, month and year', () => {
    const facility = {
      'coverEndDate-day': null,
      'coverEndDate-month': null,
      'coverEndDate-year': null,
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });

  it('should return undefined if empty day, month and year', () => {
    const facility = {
      'coverEndDate-day': '',
      'coverEndDate-month': '',
      'coverEndDate-year': '',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });
});

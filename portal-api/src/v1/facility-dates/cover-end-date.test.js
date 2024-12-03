const { format } = require('date-fns');
const { hasAllCoverEndDateValues, updateCoverEndDate } = require('./cover-end-date');

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

  it("should return false if day, month and year don't exist", () => {
    const facility = {
      'coverEndDate-day': '',
      'coverEndDate-month': '',
      'coverEndDate-year': '',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it("should return false if the year doesn't exist", () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it("should return false if the month doesn't exist", () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '',
      'coverEndDate-year': '2022',
    };

    const result = hasAllCoverEndDateValues(facility);

    expect(result).toEqual(false);
  });

  it("should return false if the day doesn't exist", () => {
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
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should return facility.coverEndDate if facility has valid day, month, year', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);
    expect(result.coverEndDate).toEqual('1652310000000'); // 12th May 2022 00:00.000 as Unix Timestamp
  });

  describe('should maintain moment js behaviour for date construction', () => {
    it('should use todays date if invalid date', () => {
      const facility = {
        'coverEndDate-day': '##',
        'coverEndDate-month': '01',
        'coverEndDate-year': '2022',
      };

      const result = updateCoverEndDate(facility);
      const date = new Date(Number(result.coverEndDate));

      expect(format(date, 'dd')).toEqual(format(new Date(), 'dd'));
      expect(format(date, 'MM')).toEqual('01');
      expect(format(date, 'yyyy')).toEqual('2022');
    });

    it('should use the current year if invalid year', () => {
      const facility = {
        'coverEndDate-day': '12',
        'coverEndDate-month': '01',
        'coverEndDate-year': '####',
      };

      const result = updateCoverEndDate(facility);
      const date = new Date(Number(result.coverEndDate));

      expect(format(date, 'dd')).toEqual('12');
      expect(format(date, 'MM')).toEqual('01');
      expect(format(date, 'yyyy')).toEqual(format(new Date(), 'yyyy'));
    });
  });

  it('should return NaN if invalid month', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '##',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toEqual('NaN');
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

  it('should return undefined if null day only', () => {
    const facility = {
      'coverEndDate-day': null,
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });

  it('should return undefined if null month only', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': null,
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });

  it('should return undefined if null year only', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': null,
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
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

  it('should return undefined if empty day only', () => {
    const facility = {
      'coverEndDate-day': '',
      'coverEndDate-month': '05',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });

  it('should return undefined if empty month only', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '',
      'coverEndDate-year': '2022',
    };

    const result = updateCoverEndDate(facility);

    expect(result.coverEndDate).toBeUndefined();
  });

  it('should return undefined if empty year only', () => {
    const facility = {
      'coverEndDate-day': '12',
      'coverEndDate-month': '05',
      'coverEndDate-year': '',
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

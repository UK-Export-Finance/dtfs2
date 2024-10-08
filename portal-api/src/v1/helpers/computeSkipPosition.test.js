const computeSkipPosition = require('./computeSkipPosition');

describe('hasAdditionalFiltersStart', () => {
  it('should return provided start page when additional filters is empty', () => {
    const filters = {};

    const sort = {};
    const result = computeSkipPosition(20, filters, sort);

    expect(result).toEqual(20);
  });

  it('should return provided start page when additional filters is set as bank id only', () => {
    const filters = {
      AND: [
        {
          'bank.id': '9',
        },
      ],
    };

    const sort = {};
    const result = computeSkipPosition(20, filters, sort);

    expect(result).toEqual(20);
  });

  it('should return start page as 0 when additional filters contains OR and sort is not set', () => {
    const filters = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ dealType: 'GEF' }],
        },
      ],
    };

    const sort = {};
    const result = computeSkipPosition(20, filters, sort);

    expect(result).toEqual(0);
  });

  it('should return provided start page when additional filters contains OR and sort is set', () => {
    const filters = {
      AND: [
        {
          'bank.id': '9',
        },
        {
          OR: [{ dealType: 'GEF' }],
        },
      ],
    };

    const sort = { exporterName: 1 };

    const result = computeSkipPosition(20, filters, sort);

    expect(result).toEqual(20);
  });
});

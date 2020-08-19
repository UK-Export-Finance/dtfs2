const { calculateExposurePeriod } = require('../../../../src/v1/controllers/integration/helpers');

describe('calculate exposure period', () => {
  const notEndMonthFacilityDayLessThan = {
    'requestedCoverStartDate-day': '21',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '20',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const notEndMonthFacilityDayGreaterThan = {
    'requestedCoverStartDate-day': '02',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '20',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const notEndMonthFacilityDaySame = {
    'requestedCoverStartDate-day': '20',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '20',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const commenceEndOfMonthFacility = {
    'requestedCoverStartDate-day': '31',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '20',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const expireEndOfMonthFacility = {
    'requestedCoverStartDate-day': '01',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '30',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const commenceAndExpireEndOfMonthFacility = {
    'requestedCoverStartDate-day': '31',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '30',
    'coverEndDate-month': '09',
    'coverEndDate-year': '2021',
  };

  const unissuedFacility = {
    ukefGuaranteeInMonths: 9,
  };

  it('doesn\'t alter value if dates are not valid for unissued facility correctly', () => {
    const unissued = calculateExposurePeriod(unissuedFacility, 'BSS');
    expect(unissued).toEqual(unissuedFacility.ukefGuaranteeInMonths);
  });


  it('calculates BSS totals correctly', () => {
    const notEndOfMonthDayLessThan = calculateExposurePeriod(notEndMonthFacilityDayLessThan, 'BSS');
    expect(notEndOfMonthDayLessThan).toEqual(12);

    const notEndOfMonthDaySame = calculateExposurePeriod(notEndMonthFacilityDaySame, 'BSS');
    expect(notEndOfMonthDaySame).toEqual(14);

    const notEndOfMonthDayGreaterThan = calculateExposurePeriod(notEndMonthFacilityDayGreaterThan, 'BSS');
    expect(notEndOfMonthDayGreaterThan).toEqual(14);

    const commenceEndOfMonth = calculateExposurePeriod(commenceEndOfMonthFacility, 'BSS');
    expect(commenceEndOfMonth).toEqual(12);

    const expireEndOfMonth = calculateExposurePeriod(expireEndOfMonthFacility, 'BSS');
    expect(expireEndOfMonth).toEqual(14);

    const commenceAndExpireEndOfMonth = calculateExposurePeriod(commenceAndExpireEndOfMonthFacility, 'BSS');
    expect(commenceAndExpireEndOfMonth).toEqual(13);
  });

  it('calculates EWCS totals correctly', () => {
    const notEndOfMonthDayLessThan = calculateExposurePeriod(notEndMonthFacilityDayLessThan, 'EWCS');
    expect(notEndOfMonthDayLessThan).toEqual(12);

    const notEndOfMonthDaySame = calculateExposurePeriod(notEndMonthFacilityDaySame, 'EWCS');
    expect(notEndOfMonthDaySame).toEqual(13);

    const notEndOfMonthDayGreaterThan = calculateExposurePeriod(notEndMonthFacilityDayGreaterThan, 'EWCS');
    expect(notEndOfMonthDayGreaterThan).toEqual(14);

    const commenceEndOfMonth = calculateExposurePeriod(commenceEndOfMonthFacility, 'EWCS');
    expect(commenceEndOfMonth).toEqual(12);

    const expireEndOfMonth = calculateExposurePeriod(expireEndOfMonthFacility, 'EWCS');
    expect(expireEndOfMonth).toEqual(14);

    const commenceAndExpireEndOfMonth = calculateExposurePeriod(commenceAndExpireEndOfMonthFacility, 'EWCS');
    expect(commenceAndExpireEndOfMonth).toEqual(12);
  });
});

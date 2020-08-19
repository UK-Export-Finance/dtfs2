const { calculateExposurePeriod } = require('../../../../src/v1/controllers/integration/helpers');

describe('calculate exposure period', () => {
  const notEndMonthFacilityDayLessThan = {
    'requestedCoverStartDate-day': '20',
    'requestedCoverStartDate-month': '08',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '17',
    'coverEndDate-month': '10',
    'coverEndDate-year': '2022',
  };

  const notEndMonthFacilityDayGreaterThan = {
    'requestedCoverStartDate-day': '01',
    'requestedCoverStartDate-month': '09',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '10',
    'coverEndDate-month': '08',
    'coverEndDate-year': '2022',
  };

  const notEndMonthFacilityDaySame = {
    'requestedCoverStartDate-day': '19',
    'requestedCoverStartDate-month': '11',
    'requestedCoverStartDate-year': '2020',
    'coverEndDate-day': '19',
    'coverEndDate-month': '11',
    'coverEndDate-year': '2022',
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
    expect(notEndOfMonthDayLessThan).toEqual(26);

    const notEndOfMonthDaySame = calculateExposurePeriod(notEndMonthFacilityDaySame, 'BSS');
    expect(notEndOfMonthDaySame).toEqual(24);

    const notEndOfMonthDayGreaterThan = calculateExposurePeriod(notEndMonthFacilityDayGreaterThan, 'BSS');
    expect(notEndOfMonthDayGreaterThan).toEqual(24);

    const commenceEndOfMonth = calculateExposurePeriod(commenceEndOfMonthFacility, 'BSS');
    expect(commenceEndOfMonth).toEqual(13);

    const expireEndOfMonth = calculateExposurePeriod(expireEndOfMonthFacility, 'BSS');
    expect(expireEndOfMonth).toEqual(14);

    const commenceAndExpireEndOfMonth = calculateExposurePeriod(commenceAndExpireEndOfMonthFacility, 'BSS');
    expect(commenceAndExpireEndOfMonth).toEqual(13);
  });

  it('calculates EWCS totals correctly', () => {
    const notEndOfMonthDayLessThan = calculateExposurePeriod(notEndMonthFacilityDayLessThan, 'EWCS');
    expect(notEndOfMonthDayLessThan).toEqual(26);

    const notEndOfMonthDaySame = calculateExposurePeriod(notEndMonthFacilityDaySame, 'EWCS');
    expect(notEndOfMonthDaySame).toEqual(24);

    const notEndOfMonthDayGreaterThan = calculateExposurePeriod(notEndMonthFacilityDayGreaterThan, 'EWCS');
    expect(notEndOfMonthDayGreaterThan).toEqual(24);

    const commenceEndOfMonth = calculateExposurePeriod(commenceEndOfMonthFacility, 'EWCS');
    expect(commenceEndOfMonth).toEqual(13);

    const expireEndOfMonth = calculateExposurePeriod(expireEndOfMonthFacility, 'EWCS');
    expect(expireEndOfMonth).toEqual(14);

    const commenceAndExpireEndOfMonth = calculateExposurePeriod(commenceAndExpireEndOfMonthFacility, 'EWCS');
    expect(commenceAndExpireEndOfMonth).toEqual(13);
  });
});

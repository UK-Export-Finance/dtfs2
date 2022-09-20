import coverDatesValidation from './coverDatesValidation.helper';

describe('coverDatesValidation()', () => {
  it('should return empty errors if one of the day/month/year is blank', () => {
    const day = '';
    const month = '05';
    const year = '2022';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toEqual('');
    expect(coverMonthValidation.error).toEqual('');
    expect(coverYearValidation.error).toEqual('');
  });

  it('should return cover day errors if the day has symbols in it', () => {
    const day = '**';
    const month = '05';
    const year = '2022';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toEqual(expect.any(Object));
    expect(coverMonthValidation.error).toBeUndefined();
    expect(coverYearValidation.error).toBeUndefined();
  });

  it('should return cover day errors if the day has more than 2 numbers in it', () => {
    const day = '321';
    const month = '05';
    const year = '2022';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toEqual(expect.any(Object));
    expect(coverMonthValidation.error).toBeUndefined();
    expect(coverYearValidation.error).toBeUndefined();
  });

  it('should return cover month errors if the month has symbols in it', () => {
    const day = '01';
    const month = '//';
    const year = '2022';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toBeUndefined();
    expect(coverMonthValidation.error).toEqual(expect.any(Object));
    expect(coverYearValidation.error).toBeUndefined();
  });

  it('should return cover month errors if the month has more than 2 numbers in it', () => {
    const day = '01';
    const month = '112';
    const year = '2022';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toBeUndefined();
    expect(coverMonthValidation.error).toEqual(expect.any(Object));
    expect(coverYearValidation.error).toBeUndefined();
  });

  it('should return cover year errors if the day has symbols in it', () => {
    const day = '01';
    const month = '11';
    const year = '2O22';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toBeUndefined();
    expect(coverMonthValidation.error).toBeUndefined();
    expect(coverYearValidation.error).toEqual(expect.any(Object));
  });

  it('should return cover month errors if the day has more than 2 numbers in it', () => {
    const day = '01';
    const month = '11';
    const year = '20223';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toBeUndefined();
    expect(coverMonthValidation.error).toBeUndefined();
    expect(coverYearValidation.error).toEqual(expect.any(Object));
  });

  it('should errors if the day and month and year are incorrectly filled in', () => {
    const day = '01*';
    const month = '1*1';
    const year = '2O23';

    const {
      coverYearValidation,
      coverMonthValidation,
      coverDayValidation,
    } = coverDatesValidation(day, month, year);

    expect(coverDayValidation.error).toEqual(expect.any(Object));
    expect(coverMonthValidation.error).toEqual(expect.any(Object));
    expect(coverYearValidation.error).toEqual(expect.any(Object));
  });
});

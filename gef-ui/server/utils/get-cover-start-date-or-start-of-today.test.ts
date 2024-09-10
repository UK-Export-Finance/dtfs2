import { Facility } from '../types/facility';
import { getCoverStartDateOrStartOfToday } from './get-cover-start-date-or-start-of-today';

describe('getCoverStartDateOrStartOfToday', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1725534606350);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('returns the start of the cover start date, if provided', () => {
    const facility = { coverStartDate: '2024-09-06T11:13:32.110Z' } as Facility;

    const result = getCoverStartDateOrStartOfToday(facility);

    expect(result).toEqual(new Date(2024, 8, 6));
  });

  it('returns the start of today, if cover start date not provided', () => {
    const facility = {} as Facility;

    const result = getCoverStartDateOrStartOfToday(facility);

    expect(result).toEqual(new Date(2024, 8, 5));
  });
});

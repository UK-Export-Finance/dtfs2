import { addMonthsToMonthAsNumber } from './addMonthsToMonthAsNumber';

describe('addMonthsToMonthAsNumber', () => {
  it.each([
    { month: 1, numberToAdd: 1, expectedResponse: 2 },
    { month: 2, numberToAdd: 2, expectedResponse: 4 },
    { month: 3, numberToAdd: 2, expectedResponse: 5 },
    { month: 10, numberToAdd: 3, expectedResponse: 1 },
    { month: 11, numberToAdd: 2, expectedResponse: 1 },
    { month: 12, numberToAdd: 5, expectedResponse: 5 },
  ])('should return $expectedResponse when $numberToAdd months is/are added to month $month', ({ month, numberToAdd, expectedResponse }) => {
    const response = addMonthsToMonthAsNumber(month, numberToAdd);
    expect(response).toEqual(expectedResponse);
  });
});

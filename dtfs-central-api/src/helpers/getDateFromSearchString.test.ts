import { format, getYear, set, startOfDay } from "date-fns";
import { getDateFromSearchString } from "./getDateFromSearchString";

describe('getDateFromSearchString', () => {

  const acceptedFormatsWithYear = [
    "dd-MM-yyyy",
    "dd/MM/yyyy",
    "dd MM yyyy",
    "dd-MM-yy",
    "dd/MM/yy",
    "dd MM yy",
    "ddMMyy",
    "ddMMyyyy",
    "d-MM-yyyy",
    "d/M/yyyy",
    "d M yyyy",
    "d-M-yy",
    "d/M/yy",
    "d M yy",
  ];

  const acceptedFormatsWithoutYear = [
    "dd-MM",
    "dd/MM",
    "dd MM",
    "d-M",
    "d/M",
    "d M",
  ]

  const mockDate = new Date(2023, 6, 6);
  const currentYear = getYear(new Date());
  const mockDateWithCurrentYear = set(mockDate, { year: currentYear })

  const testDataWithYear = acceptedFormatsWithYear.map((formatString) => ({
    formatString,
    mockString: format(mockDate, formatString),
    expectedDate: mockDate
  }));
  const testDataWithoutYear = acceptedFormatsWithoutYear.map((formatString) => ({
    formatString,
    mockString: format(mockDate, formatString),
    expectedDate: mockDateWithCurrentYear
  }))


  it.each([...testDataWithYear, ...testDataWithoutYear])('should correctly parse a date in the format $formatString', ({ mockString, expectedDate }) => {
    const result = getDateFromSearchString(mockString);

    expect(result).toEqual(startOfDay(expectedDate));
  });
});

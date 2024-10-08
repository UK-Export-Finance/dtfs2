import { getYear, parse, set, startOfDay } from 'date-fns';

/**
 *
 * @param searchString a string with which to query the database
 * @returns a date, parsed as any of this is one of the accepted formats, or invalid date if not
 *
 * Accepted formats:
 *  - dd-MM-yyyy
 *  - dd/MM/yyyy
 *  - dd MM yyyy
 *  - dd-MM-yy
 *  - dd/MM/yy
 *  - dd MM yy
 *  - ddMMyy
 *  - ddMMyyyy
 *
 * Using the current year if not specified:
 *  - dd-MM
 *  - dd/MM
 *  - dd MM
 */
export const getDateFromSearchString = (searchString: string) => {
  const acceptedDateSeparators = /[ /-]/;
  const [day, month, parsedYear] = searchString.split(acceptedDateSeparators);

  if (!month) {
    if (searchString.length === 8) {
      return parse(searchString, 'ddMMyyyy', new Date());
    }
    if (searchString.length === 6) {
      return parse(searchString, 'ddMMyy', new Date());
    }
    return new Date(NaN);
  }

  let year;

  if (!parsedYear) {
    year = getYear(new Date());
  } else if (parsedYear.length < 4) {
    year = 2000 + Number(parsedYear);
  } else {
    year = Number(parsedYear);
  }

  return set(startOfDay(new Date()), {
    year,
    month: Number(month) - 1,
    date: Number(day),
  });
};

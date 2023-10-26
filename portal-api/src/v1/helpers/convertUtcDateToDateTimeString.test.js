const { formatDateTimeForEmail } = require('./covertUtcDateToDateTimeString');

describe('formatDateTimeForEmail', () => {
  const isoStringUkSummer = '2023-07-05T16:26:35.123Z';
  const isoStringUkWinter = '2023-01-05T16:26:35.123Z';
  const isoStringUkMidnight = '2023-03-05T00:26:35.123Z';
  const isoStringUkMidday = '2023-03-05T12:26:35.123Z';

  const formattedDateBst = '5 July 2023 at 5:26 pm';
  const formattedDateGmt = '5 January 2023 at 4:26 pm';
  const formattedDateMidnight = '5 March 2023 at 12:26 am';
  const formattedDateMidday = '5 March 2023 at 12:26 pm';


  it('should format ISO string in UK summer to custom date format in BST', () => {
    const customDate = formatDateTimeForEmail(isoStringUkSummer);

    expect(customDate).toEqual(formattedDateBst);
  });

  it('should format ISO string in UK winter to custom date format in GMT', () => {
    const customDate = formatDateTimeForEmail(isoStringUkWinter);

    expect(customDate).toEqual(formattedDateGmt);
  });

  it('should format ISO string between midnight and 1 am to custom date format in GMT', () => {
    const customDate = formatDateTimeForEmail(isoStringUkMidnight);

    expect(customDate).toEqual(formattedDateMidnight);
  });

  it('should format ISO string between midday and 1 pm to custom date format in GMT', () => {
    const customDate = formatDateTimeForEmail(isoStringUkMidday);

    expect(customDate).toEqual(formattedDateMidday);
  });
});

const { formatDateTimeForEmail } = require('./utilisation-report-upload.controller');

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  const isoStringUkSummer = '2023-07-05T16:26:35.123Z';
  const isoStringUkWinter = '2023-01-05T16:26:35.123Z';

  const formattedDateBst = '5 July 2023 at 5:26 pm';
  const formattedDateGmt = '5 January 2023 at 4:26 pm';

  it('should format ISO string in UK summer to custom date format in BST', () => {
    const customDate = formatDateTimeForEmail(isoStringUkSummer);

    expect(customDate).toEqual(formattedDateBst);
  });

  it('should format ISO string in UK winter to custom date format in GMT', () => {
    const customDate = formatDateTimeForEmail(isoStringUkWinter);

    expect(customDate).toEqual(formattedDateGmt);
  });
});

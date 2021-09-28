const moment = require('moment');
require('moment-timezone'); // monkey-patch to provide moment().tz(;

const {
  generateDateFromSubmissionDate,
  dateReceived,
} = require('./dateReceived');

describe('deal submit - add TFM data - date received', () => {
  const mockSubmissionDate = '1623411666338';

  const expectedSubmissionDate = (date) => {
    const utc = moment(parseInt(date, 10));
    const localisedTimestamp = utc.tz('Europe/London');

    return localisedTimestamp.format('DD-MM-YYYY');
  };

  describe('generateDateFromSubmissionDate', () => {
    it('should return formatted date', () => {
      const result = generateDateFromSubmissionDate(mockSubmissionDate);

      expect(result).toEqual(expectedSubmissionDate(mockSubmissionDate));
    });
  });

  it('should return timestmap', async () => {
    const result = await dateReceived(mockSubmissionDate);

    const expected = generateDateFromSubmissionDate(mockSubmissionDate);

    expect(result).toEqual(expected);
  });
});

const moment = require('moment');
require('moment-timezone'); // monkey-patch to provide moment().tz(;

const {
  generateDateFromSubmissionDate,
  addDealDateReceived,
} = require('./deal.add-date-received');

describe('deal.add-date-received', () => {
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

  describe('addDealDateReceived', () => {
    it('should add dateReceived to deal.tfm', async () => {
      const mockDeal = {
        submissionDate: mockSubmissionDate,
        tfm: {
          test: true,
        },
      };

      const result = await addDealDateReceived(mockDeal);

      const expectedDate = generateDateFromSubmissionDate(mockSubmissionDate);

      expect(result.tfm).toEqual({
        ...mockDeal.tfm,
        dateReceived: expectedDate,
      });
    });
  });
});

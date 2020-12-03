const { formatDate } = require('../../../../src/v1/controllers/integration/helpers/date-helpers');
const dateHelper = require('../../../../src/v1/controllers/integration/helpers/date-helpers');

describe('converts date for integration', () => {
  describe('format day, month, year', () => {
    it('return empty string if no date given', () => {
      const formattedDate = dateHelper.formatDate('', '', '');
      expect(formattedDate).toEqual('');
    });

    it('converts date in format dd-mm,yyyy', () => {
      const formattedDate = dateHelper.formatDate('01', '09', '2020');
      expect(formattedDate).toEqual('01-09-2020');
    });

    it('converts date in format d-m,yy', () => {
      const formattedDate = dateHelper.formatDate('1', '9', '20');
      expect(formattedDate).toEqual('01-09-2020');
    });
  });

  describe('format timestamp', () => {
    it('converts a valid timestamp', () => {
      const formattedTimestamp = dateHelper.formatTimestamp('1601294303901');
      expect(formattedTimestamp).toEqual('28-09-2020');
    });

    it('return empty string on non-valid timestamp', () => {
      const formattedTimestamp = dateHelper.formatTimestamp('16012943039010000000000000000');
      expect(formattedTimestamp).toEqual('');
    });
  });

  describe('format year', () => {
    it('formats a year to 4 digits', () => {
      const formattedYear4DigitStr = dateHelper.formatYear('2020');
      const formattedYear2DigitStr = dateHelper.formatYear('20');
      const formattedYear4DigitNum = dateHelper.formatYear(2020);
      const formattedYear2DigitNum = dateHelper.formatYear(20);

      expect(formattedYear4DigitStr).toEqual('2020');
      expect(formattedYear2DigitStr).toEqual('2020');
      expect(formattedYear4DigitNum).toEqual('2020');
      expect(formattedYear2DigitNum).toEqual('2020');
    });
  });
});

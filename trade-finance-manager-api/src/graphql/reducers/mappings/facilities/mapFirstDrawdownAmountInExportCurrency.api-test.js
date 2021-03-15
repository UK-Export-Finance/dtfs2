const mapFirstDrawdownAmountInExportCurrency = require('./mapFirstDrawdownAmountInExportCurrency');
const { formattedNumber } = require('../../../../utils/number');

describe('mapFirstDrawdownAmountInExportCurrency', () => {
  describe('when facility is loan', () => {
    it('should return facility currency with formatted disbursementAmount', () => {
      const mockFacility = {
        facilityProduct: {
          code: 'EWCS',
        },
        disbursementAmount: '12345',
      };

      const result = mapFirstDrawdownAmountInExportCurrency(mockFacility);

      const formattedDisbursementAmount = formattedNumber(mockFacility.disbursementAmount, 4);

      const expected = `${mockFacility.currency} ${formattedDisbursementAmount}`;
      expect(result).toEqual(expected);
    });
  });

  describe('when facility is bond', () => {
    it('should return null', () => {
      const mockFacility = {
        facilityProduct: {
          code: 'BSS',
        },
      };

      const result = mapFirstDrawdownAmountInExportCurrency(mockFacility);
      expect(result).toEqual(null);
    });
  });
});

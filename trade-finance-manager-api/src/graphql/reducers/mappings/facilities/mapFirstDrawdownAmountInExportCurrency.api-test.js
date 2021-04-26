const mapFirstDrawdownAmountInExportCurrency = require('./mapFirstDrawdownAmountInExportCurrency');
const { formattedNumber } = require('../../../../utils/number');
const { stripCommas } = require('../../../../utils/string');

describe('mapFirstDrawdownAmountInExportCurrency', () => {
  describe('when facility is loan', () => {
    it('should return facility currency with formatted disbursementAmount', () => {
      const mockFacility = {
        facilityProduct: {
          code: 'EWCS',
        },
        disbursementAmount: '12,1234.00',
        currency: {
          text: 'CAD - Canadian Dollars',
          id: 'CAD',
        },
      };

      const result = mapFirstDrawdownAmountInExportCurrency(mockFacility);

      const strippedDisbursementAmount = stripCommas(mockFacility.disbursementAmount);

      const formattedDisbursementAmount = formattedNumber(strippedDisbursementAmount, 2, 2);

      const expected = `${mockFacility.currency.id} ${formattedDisbursementAmount}`;
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

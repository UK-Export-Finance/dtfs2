const {
  formattedNumber,
  calculateDealSummary,
} = require('../../../src/v1/deal-summary');

describe('deal-summary', () => {
  describe('with no supplyContractConversionRateToGBP', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '',
        },
        bondTransactions: {
          items: [
            { status: 'Completed' },
          ],
        },
        loanTransactions: {
          items: [
            { status: 'Completed' },
            { status: 'Completed' },
          ],
        },
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('with no completed bonds or loans', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '50',
        },
        bondTransactions: {
          items: [],
        },
        loanTransactions: {
          items: [
            { status: 'Incomplete' },
            { status: 'Incomplete' },
          ],
        },
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('when a deal has supplyContractConversionRateToGBP and completed bonds or loans', () => {
    let result;

    const mockDeal = {
      submissionDetails: {
        supplyContractConversionRateToGBP: '50',
      },
      bondTransactions: {
        items: [
          {
            status: 'Completed',
            facilityValue: '123456.45',
            conversionRate: '80',
          },
          {
            status: 'Completed',
            facilityValue: '1000.24',
            conversionRate: '40',
          },
        ],
      },
      loanTransactions: {
        items: [
          {
            status: 'Completed',
            facilityValue: '5000.10',
            conversionRate: '90',
          },
          {
            status: 'Completed',
            facilityValue: '10500.67',
            conversionRate: '40',
          },
        ],
      },
    };

    const totalAllBonds = () => {
      const firstBond = mockDeal.bondTransactions.items[0];
      const lastBond = mockDeal.bondTransactions.items[1];

      let total = 0;
      total = Number(firstBond.facilityValue) / Number(firstBond.conversionRate);
      total += Number(lastBond.facilityValue) / Number(lastBond.conversionRate);
      return total;
    };

    const totalAllLoans = () => {
      const firstLoan = mockDeal.loanTransactions.items[0];
      const lastLoan = mockDeal.loanTransactions.items[1];

      let total = 0;
      total = Number(firstLoan.facilityValue) / Number(firstLoan.conversionRate);
      total += Number(lastLoan.facilityValue) / Number(lastLoan.conversionRate);
      return total;
    };

    beforeEach(() => {
      result = calculateDealSummary(mockDeal);
    });

    describe('totalValue object', () => {
      it('should be returned', () => {
        expect(result.totalValue).toBeDefined();
        expect(Object.keys(result.totalValue).length > 0).toEqual(true);
      });

      it('should have correct, formatted dealCurrency calculation', () => {
        const expected = formattedNumber(totalAllBonds() + totalAllLoans());
        expect(result.totalValue.dealCurrency).toEqual(expected);
      });

      it('should have correct, formatted dealInGbp calculation', () => {
        const bondInGbp = (totalAllBonds() / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const loanInGbp = (totalAllLoans() / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const calculation = (bondInGbp + loanInGbp);
        const expected = formattedNumber(calculation);
        expect(result.totalValue.dealInGbp).toEqual(expected);
      });

      it('should have correct, formatted bondCurrency calculation', () => {
        const expected = formattedNumber(totalAllBonds());
        expect(result.totalValue.bondCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondInGbp calculation', () => {
        const calculation = (totalAllBonds() / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(calculation);
        expect(result.totalValue.bondInGbp).toEqual(expected);
      });

      it('should have correct, formatted loanCurrency calculation', () => {
        const expected = formattedNumber(totalAllLoans());
        expect(result.totalValue.loanCurrency).toEqual(expected);
      });

      it('should have correct, formatted loanInGbp calculation', () => {
        const calculation = (totalAllLoans() / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(calculation);
        expect(result.totalValue.loanInGbp).toEqual(expected);
      });
    });
  });
});

const calculateDealSummary = require('../../../src/v1/deal-summary');
const {
  roundNumber,
  formattedNumber,
} = require('../../../src/utils/number');

describe('deal-summary', () => {
  const calculateTotalAllBonds = (bondTransactions) => {
    const firstBond = bondTransactions.items[0];
    const lastBond = bondTransactions.items[1];

    let total = 0;
    total = Number(firstBond.facilityValue) / Number(firstBond.conversionRate);
    total += Number(lastBond.facilityValue) / Number(lastBond.conversionRate);
    return total;
  };

  const calculateTotalAllLoans = (loanTransactions) => {
    const firstLoan = loanTransactions.items[0];
    const lastLoan = loanTransactions.items[1];

    let total = 0;
    total = Number(firstLoan.facilityValue) / Number(firstLoan.conversionRate);
    total += Number(lastLoan.facilityValue) / Number(lastLoan.conversionRate);
    return total;
  };

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
            currency: { id: 'EUR', text: 'Euros' },
          },
          {
            status: 'Completed',
            facilityValue: '1000.24',
            conversionRate: '40',
            currency: { id: 'EUR', text: 'Euros' },
          },
        ],
      },
      loanTransactions: {
        items: [
          {
            status: 'Completed',
            facilityValue: '5000.10',
            conversionRate: '90',
            currency: { id: 'EUR', text: 'Euros' },
          },
          {
            status: 'Completed',
            facilityValue: '10500.67',
            conversionRate: '40',
            currency: { id: 'EUR', text: 'Euros' },
          },
        ],
      },
    };

    const totalAllBonds = calculateTotalAllBonds(mockDeal.bondTransactions);
    const totalAllLoans = calculateTotalAllLoans(mockDeal.loanTransactions);

    beforeEach(() => {
      result = calculateDealSummary(mockDeal);
    });

    describe('totalValue object', () => {
      it('should be returned', () => {
        expect(result.totalValue).toBeDefined();
        expect(Object.keys(result.totalValue).length > 0).toEqual(true);
      });

      it('should have correct, formatted dealCurrency calculation', () => {
        const calculation = totalAllBonds + totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.dealCurrency).toEqual(expected);
      });

      it('should have correct, formatted dealInGbp calculation', () => {
        const bondInGbp = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const loanInGbp = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const calculation = (bondInGbp + loanInGbp);
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.dealInGbp).toEqual(expected);
      });

      it('should have correct, formatted bondCurrency calculation', () => {
        const calculation = totalAllBonds;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondInGbp calculation', () => {
        const calculation = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondInGbp).toEqual(expected);
      });

      it('should have correct, formatted loanCurrency calculation', () => {
        const calculation = totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.loanCurrency).toEqual(expected);
      });

      it('should have correct, formatted loanInGbp calculation', () => {
        const calculation = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.loanInGbp).toEqual(expected);
      });

      describe('completed bonds/loans GBP currency conditions', () => {
        const mockTransactions = {
          items: [
            {
              status: 'Completed',
              facilityValue: '123456.45',
              conversionRate: '80',
              currency: { id: 'GBP', text: 'UK Sterling' },
            },
            {
              status: 'Completed',
              facilityValue: '1000.24',
              conversionRate: '40',
              currency: { id: 'EUR', text: 'Euros' },
            },
          ],
        };

        describe('when any completed bond has a GBP currency', () => {
          let calculation;
          let expected;

          beforeEach(() => {
            mockDeal.bondTransactions = mockTransactions;
            mockDeal.loanTransactions = { items: [] };
            result = calculateDealSummary(mockDeal);

            calculation = calculateTotalAllBonds(mockDeal.bondTransactions);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted bondInGbp calculation without using supplyContractConversionRateToGbp', () => {
            expect(result.totalValue.bondInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using supplyContractConversionRateToGbp', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when any completed loan has a GBP currency', () => {
          let calculation;
          let expected;

          beforeEach(() => {
            mockDeal.bondTransactionloanTransactions = mockTransactions;
            mockDeal.bondTransactions = { items: [] };

            result = calculateDealSummary(mockDeal);
            calculation = calculateTotalAllLoans(mockDeal.loanTransactions);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted loanInGbp calculation without using supplyContractConversionRateToGbp', () => {
            expect(result.totalValue.loanInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using supplyContractConversionRateToGbp', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when both completed loans and bonds have a GBP currency', () => {
          it('should have formatted dealInGbp calculation without using supplyContractConversionRateToGbp', () => {
            mockDeal.bondTransactionloanTransactions = mockTransactions;
            mockDeal.bondTransactions = mockTransactions;

            result = calculateDealSummary(mockDeal);
            const calculation = (calculateTotalAllLoans(mockDeal.loanTransactions) + calculateTotalAllBonds(mockDeal.bondTransactions));
            const expected = formattedNumber(roundNumber(calculation), 2);

            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });
      });
    });
  });
});

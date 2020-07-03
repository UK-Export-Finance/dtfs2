const calculateDealSummary = require('../../../src/v1/deal-summary');
const {
  roundNumber,
  formattedNumber,
} = require('../../../src/utils/number');

describe('deal-summary', () => {
  const calculateTotalAllBonds = (bondTransactions) => {
    let total = 0;
    bondTransactions.items.forEach((bond) => {
      if (bond.conversionRate) {
        total += Number(bond.facilityValue) / Number(bond.conversionRate);
      } else {
        total += Number(bond.facilityValue);
      }
    });
    return total;
  };

  const calculateTotalAllLoans = (loanTransactions) => {
    let total = 0;
    loanTransactions.items.forEach((loan) => {
      if (loan.conversionRate) {
        total += Number(loan.facilityValue) / Number(loan.conversionRate);
      } else {
        total += Number(loan.facilityValue);
      }
    });
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
  // TODO: update tests for new submissionDetails conditions

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

  describe('when a deal has relevant Supply Contract fields and completed bonds or loans', () => {
    let result;

    const mockDeal = {
      submissionDetails: {
        supplyContractCurrency: {
          id: 'AUD',
        },
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

      it('should have correct, formatted dealInDealCurrency calculation', () => {
        const calculation = totalAllBonds + totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.dealInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted dealInGbp calculation', () => {
        const bondInGbp = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const loanInGbp = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const calculation = (bondInGbp + loanInGbp);
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.dealInGbp).toEqual(expected);
      });

      it('should have correct, formatted bondInDealCurrency calculation', () => {
        const calculation = totalAllBonds;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondInGbp calculation', () => {
        const calculation = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondInGbp).toEqual(expected);
      });

      it('should have correct, formatted loanInDealCurrency calculation', () => {
        const calculation = totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.loanInDealCurrency).toEqual(expected);
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
              currency: { id: 'GBP', text: 'UK Sterling' },
            },
            {
              status: 'Completed',
              facilityValue: '1000.24',
              currency: { id: 'EUR', text: 'Euros' },
              conversionRate: '40',
            },
          ],
        };

        describe('when any completed bond has a GBP currency (and therefore no conversionRate)', () => {
          let calculation;
          let expected;

          beforeEach(() => {
            mockDeal.bondTransactions = mockTransactions;
            mockDeal.loanTransactions = { items: [] };
            result = calculateDealSummary(mockDeal);

            calculation = (calculateTotalAllBonds(mockDeal.bondTransactions) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted bondInGbp calculation without using bond conversionRate', () => {
            expect(result.totalValue.bondInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using bond conversionRate', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when any completed loan has a GBP currency (and therefore no conversionRate)', () => {
          let calculation;
          let expected;

          beforeEach(() => {
            mockDeal.loanTransactions = mockTransactions;
            mockDeal.bondTransactions = { items: [] };

            result = calculateDealSummary(mockDeal);
            calculation = (calculateTotalAllLoans(mockDeal.loanTransactions) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted loanInGbp calculation without using loan conversionRate', () => {
            expect(result.totalValue.loanInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using loan conversionRate', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when both completed loans and bonds have a GBP currency', () => {
          it('should have formatted dealInGbp calculation without using loans/bonds conversionRates', () => {
            mockDeal.loanTransactions = mockTransactions;
            mockDeal.bondTransactions = mockTransactions;

            result = calculateDealSummary(mockDeal);
            const totalBondsAndLoans = (calculateTotalAllBonds(mockDeal.bondTransactions) + calculateTotalAllLoans(mockDeal.loanTransactions));
            const calculation = (totalBondsAndLoans / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            const expected = formattedNumber(roundNumber(calculation), 2);

            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });
      });
    });
  });
});

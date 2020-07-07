const calculateDealSummary = require('../../../src/v1/deal-summary');
const {
  roundNumber,
  formattedNumber,
} = require('../../../src/utils/number');

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

    const calculateUkefExposure = (facilityValue, coveredPercentage) =>
      String(Number(facilityValue) * (Number(coveredPercentage) / 100));

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
            coveredPercentage: '40',
            get ukefExposure() {
              return calculateUkefExposure(this.facilityValue, this.coveredPercentage);
            },
          },
          {
            status: 'Completed',
            facilityValue: '1000.24',
            conversionRate: '40',
            currency: { id: 'EUR', text: 'Euros' },
            coveredPercentage: '30',
            get ukefExposure() {
              return calculateUkefExposure(this.facilityValue, this.coveredPercentage);
            },
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
            coveredPercentage: '70',
            get ukefExposure() {
              return calculateUkefExposure(this.facilityValue, this.coveredPercentage);
            },
          },
          {
            status: 'Completed',
            facilityValue: '10500.67',
            conversionRate: '40',
            currency: { id: 'EUR', text: 'Euros' },
            coveredPercentage: '10',
            get ukefExposure() {
              return calculateUkefExposure(this.facilityValue, this.coveredPercentage);
            },
          },
        ],
      },
    };

    beforeEach(() => {
      result = calculateDealSummary(mockDeal);
    });

    describe('totalValue object', () => {
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

      const totalAllBonds = calculateTotalAllBonds(mockDeal.bondTransactions);
      const totalAllLoans = calculateTotalAllLoans(mockDeal.loanTransactions);

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
        const bondsInGbp = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const loansInGbp = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const calculation = (bondsInGbp + loansInGbp);
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.dealInGbp).toEqual(expected);
      });

      it('should have correct, formatted bondsInDealCurrency calculation', () => {
        const calculation = totalAllBonds;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondsInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondsInGbp calculation', () => {
        const calculation = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.bondsInGbp).toEqual(expected);
      });

      it('should have correct, formatted loansInDealCurrency calculation', () => {
        const calculation = totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.loansInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted loansInGbp calculation', () => {
        const calculation = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalValue.loansInGbp).toEqual(expected);
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
            const mockBondTransactions = mockTransactions;

            result = calculateDealSummary({
              ...mockDeal,
              bondTransactions: mockBondTransactions,
              loanTransactions: { items: [] },
            });

            calculation = (calculateTotalAllBonds(mockBondTransactions) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted bondsInGbp calculation without using bond conversionRate', () => {
            expect(result.totalValue.bondsInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using bond conversionRate', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when any completed loan has a GBP currency (and therefore no conversionRate)', () => {
          let calculation;
          let expected;

          beforeEach(() => {
            const mockLoanTransactions = mockTransactions;

            result = calculateDealSummary({
              ...mockDeal,
              bondTransactions: { items: [] },
              loanTransactions: mockLoanTransactions,
            });
            calculation = (calculateTotalAllLoans(mockLoanTransactions) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            expected = formattedNumber(roundNumber(calculation), 2);
          });

          it('should have formatted loansInGbp calculation without using loan conversionRate', () => {
            expect(result.totalValue.loansInGbp).toEqual(expected);
          });

          it('should have formatted dealInGbp calculation without using loan conversionRate', () => {
            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });

        describe('when both completed loans and bonds have a GBP currency', () => {
          it('should have formatted dealInGbp calculation without using loans/bonds conversionRates', () => {
            const mockBondTransactions = mockTransactions;
            const mockLoanTransactions = mockTransactions;

            result = calculateDealSummary({
              ...mockDeal,
              bondTransactions: mockBondTransactions,
              loanTransactions: mockLoanTransactions,
            });

            const totalBondsAndLoans = (calculateTotalAllBonds(mockBondTransactions) + calculateTotalAllLoans(mockLoanTransactions));
            const calculation = (totalBondsAndLoans / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
            const expected = formattedNumber(roundNumber(calculation), 2);

            expect(result.totalValue.dealInGbp).toEqual(expected);
          });
        });
      });
    });

    describe('totalUkefExposure object', () => {
      const calculateTotalAllBonds = (bondTransactions) => {
        let total = 0;
        bondTransactions.items.forEach((bond) => {
          if (bond.conversionRate) {
            total += Number(bond.ukefExposure) / Number(bond.conversionRate);
          } else {
            total += Number(bond.ukefExposure);
          }
        });
        return total;
      };

      const calculateTotalAllLoans = (loanTransactions) => {
        let total = 0;
        loanTransactions.items.forEach((loan) => {
          if (loan.conversionRate) {
            total += Number(loan.ukefExposure) / Number(loan.conversionRate);
          } else {
            total += Number(loan.ukefExposure);
          }
        });
        return total;
      };

      const totalAllBonds = calculateTotalAllBonds(mockDeal.bondTransactions);
      const totalAllLoans = calculateTotalAllLoans(mockDeal.loanTransactions);

      it('should be returned', () => {
        expect(result.totalUkefExposure).toBeDefined();
        expect(Object.keys(result.totalUkefExposure).length > 0).toEqual(true);
      });

      it('should have correct, formatted dealInDealCurrency calculation', () => {
        const calculation = totalAllBonds + totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalUkefExposure.dealInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondsInDealCurrency calculation', () => {
        result = calculateDealSummary(mockDeal);
        const calculation = totalAllBonds;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalUkefExposure.bondsInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted bondsInGbp calculation', () => {
        const calculation = (totalAllBonds / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalUkefExposure.bondsInGbp).toEqual(expected);
      });

      it('should have correct, formatted loansInDealCurrency calculation', () => {
        const calculation = totalAllLoans;
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalUkefExposure.loansInDealCurrency).toEqual(expected);
      });

      it('should have correct, formatted loansInGbp calculation', () => {
        const calculation = (totalAllLoans / Number(mockDeal.submissionDetails.supplyContractConversionRateToGBP));
        const expected = formattedNumber(roundNumber(calculation), 2);
        expect(result.totalUkefExposure.loansInGbp).toEqual(expected);
      });
    });
  });
});

const calculateDealSummary = require('../../../src/v1/deal-summary');
const {
  roundNumber,
  formattedNumber,
} = require('../../../src/utils/number');

describe('deal-summary', () => {
  const calculateUkefExposure = (value, coveredPercentage) =>
    String(Number(value) * (Number(coveredPercentage) / 100));

  const mockCompletedBonds = [
    {
      type: 'Bond',
      status: 'Completed',
      value: '123456.45',
      conversionRate: '80',
      currency: { id: 'EUR', text: 'Euros' },
      coveredPercentage: '40',
      get ukefExposure() {
        return calculateUkefExposure(this.value, this.coveredPercentage);
      },
    },
    {
      type: 'Bond',
      status: 'Completed',
      value: '1000.24',
      conversionRate: '40',
      currency: { id: 'EUR', text: 'Euros' },
      coveredPercentage: '30',
      get ukefExposure() {
        return calculateUkefExposure(this.value, this.coveredPercentage);
      },
    },
  ];

  const mockCompletedLoans = [
    {
      type: 'Loan',
      status: 'Completed',
      value: '5000.10',
      conversionRate: '90',
      currency: { id: 'EUR', text: 'Euros' },
      coveredPercentage: '70',
      get ukefExposure() {
        return calculateUkefExposure(this.value, this.coveredPercentage);
      },
    },
    {
      type: 'Loan',
      status: 'Completed',
      value: '10500.67',
      conversionRate: '40',
      currency: { id: 'EUR', text: 'Euros' },
      coveredPercentage: '10',
      get ukefExposure() {
        return calculateUkefExposure(this.value, this.coveredPercentage);
      },
    },
  ];

  describe('with no supplyContractConversionRateToGBP', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '',
        },
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('with no supplyContractCurrency.id', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '50',
          supplyContractCurrency: { id: '' }
        },
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('with only `Incomplete` bonds and loans', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '50',
        },
        facilities: [
          { type: 'Bond', status: 'Incomplete' },
          { type: 'Loan', status: 'Incomplete' },
        ],
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('with only `Not started` bonds and loans', () => {
    it('should return empty object', () => {
      const mockDeal = {
        submissionDetails: {
          supplyContractConversionRateToGBP: '50',
        },
        facilities: [
          { type: 'Bond', status: 'Not started' },
          { type: 'Loan', status: 'Not started' },
        ],
      };
      expect(calculateDealSummary(mockDeal)).toEqual({});
    });
  });

  describe('when a deal has relevant Supply Contract fields', () => {
    describe('when a bond does not have a status, but has submittedAsIssuedDate', () => {
      it('should return calculations', () => {
        const mockDeal = {
          submissionDetails: {
            supplyContractConversionRateToGBP: '50',
            supplyContractCurrency: {
              id: 'AUD',
            },
          },
          facilities: [
            { type: 'Bond' status: null, submittedAsIssuedDate: true },
          ],
        };
        expect(calculateDealSummary(mockDeal).totalValue).toBeDefined();
        expect(calculateDealSummary(mockDeal).totalUkefExposure).toBeDefined();
      });
    });

    describe('when a loan does not have a status, but has submittedAsIssuedDate', () => {
      it('should return calculations', () => {
        const mockDeal = {
          submissionDetails: {
            supplyContractConversionRateToGBP: '50',
            supplyContractCurrency: {
              id: 'AUD',
            },
          },
          facilities: {
            { type: 'Loan', status: null, submittedAsIssuedDate: true },
          },
        };
        expect(calculateDealSummary(mockDeal).totalValue).toBeDefined();
        expect(calculateDealSummary(mockDeal).totalUkefExposure).toBeDefined();
      });
    });

    describe('with completed bonds or loans', () => {
      let result;

      const mockDeal = {
        submissionDetails: {
          supplyContractCurrency: {
            id: 'AUD',
          },
          supplyContractConversionRateToGBP: '50',
        },
        facilities: [
          ...mockCompletedBonds,
          ...mockCompletedLoans,
        ],
      };

      beforeEach(() => {
        result = calculateDealSummary(mockDeal);
      });

      describe('totalValue object', () => {
        const calculateTotalAllBonds = (bonds) => {
          let total = 0;
          bonds.forEach((bond) => {
            if (bond.conversionRate) {
              total += Number(bond.value) / Number(bond.conversionRate);
            } else {
              total += Number(bond.value);
            }
          });
          return total;
        };

        const calculateTotalAllLoans = (loans) => {
          let total = 0;
          loans.forEach((loan) => {
            if (loan.conversionRate) {
              total += Number(loan.value) / Number(loan.conversionRate);
            } else {
              total += Number(loan.value);
            }
          });
          return total;
        };

        const bonds = mockDeal.facilities.filter(({ type }) => type === 'Bond');
        const loans = mockDeal.facilities.filter(({ type }) => type === 'Loan');

        const totalAllBonds = calculateTotalAllBonds(bonds);
        const totalAllLoans = calculateTotalAllLoans(loans);

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

        describe('when supplyContractConversionRateToGbp does not exist', () => {
          beforeEach(() => {
            result = calculateDealSummary({
              ...mockDeal,
              submissionDetails: {
                supplyContractCurrency: {
                  id: 'GBP',
                },
              },
            });
          });

          it('should have formatted bondsInGbp calculation without using supplyContractConversionRateToGbp', () => {
            const expected = formattedNumber(roundNumber(totalAllBonds), 2);
            expect(result.totalValue.bondsInGbp).toEqual(expected);
          });

          it('should have formatted loansInGbp calculation without using supplyContractConversionRateToGbp', () => {
            const expected = formattedNumber(roundNumber(totalAllLoans), 2);
            expect(result.totalValue.loansInGbp).toEqual(expected);
          });
        });

        describe('completed bonds/loans GBP currency conditions', () => {
          const mockFacilities: [
            {
              status: 'Completed',
              value: '123456.45',
              currency: { id: 'GBP', text: 'UK Sterling' },
            },
            {
              status: 'Completed',
              value: '1000.24',
              currency: { id: 'EUR', text: 'Euros' },
              conversionRate: '40',
            },
          ];

          describe('when any completed bond has a GBP currency (and therefore no conversionRate)', () => {
            let calculation;
            let expected;

            beforeEach(() => {
              const mockBonds = mockFacilities.map((f) => ({ ...f, type: 'Bond' }));

              result = calculateDealSummary({
                ...mockDeal,
                facilities: mockBonds,
              });

              calculation = (calculateTotalAllBonds(mockBonds) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
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
              const mockLoans = mockFacilities.map((f) => ({ ...f, type: 'Bond' }));

              result = calculateDealSummary({
                ...mockDeal,
                facilities: mockLoans,
              });
              calculation = (calculateTotalAllLoans(mockLoans) / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
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
              const mockBonds = mockFacilities.map((f) => ({ ...f, type: 'Bond' }));
              const mockLoans = mockFacilities.map((f) => ({ ...f, type: 'Loan' }));

              result = calculateDealSummary({
                ...mockDeal,
                facilities: [
                  ...mockBonds,
                  ...mockLoans,
                ],
              });

              const totalBondsAndLoans = (calculateTotalAllBonds(mockBonds) + calculateTotalAllLoans(mockLoans));
              const calculation = (totalBondsAndLoans / mockDeal.submissionDetails.supplyContractConversionRateToGBP);
              const expected = formattedNumber(roundNumber(calculation), 2);

              expect(result.totalValue.dealInGbp).toEqual(expected);
            });
          });
        });
      });

      describe('totalUkefExposure object', () => {
        const calculateTotalAllBonds = (bonds) => {
          let total = 0;
          bonds.forEach((bond) => {
            if (bond.conversionRate) {
              total += Number(bond.ukefExposure) / Number(bond.conversionRate);
            } else {
              total += Number(bond.ukefExposure);
            }
          });
          return total;
        };

        const calculateTotalAllLoans = (loans) => {
          let total = 0;
          loans.forEach((loan) => {
            if (loan.conversionRate) {
              total += Number(loan.ukefExposure) / Number(loan.conversionRate);
            } else {
              total += Number(loan.ukefExposure);
            }
          });
          return total;
        };

        const bonds = mockDeal.facilities.filter((f) => f.type === 'Bond');
        const loans = mockDeal.facilities.filter((f) => f.type === 'Loan');
        const totalAllBonds = calculateTotalAllBonds(bonds);
        const totalAllLoans = calculateTotalAllLoans(loans);

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
});

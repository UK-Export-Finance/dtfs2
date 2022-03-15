const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');

describe('/v1/deals/:id/loan', () => {
  const newDeal = aDeal({
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
    eligibility: {
      criteria: [
        { id: 15, answer: true }
      ],
    },
  });

  let aBarclaysMaker;
  let deal;
  let dealId;
  let loanId;

  const updateLoanInDeal = async (theDealId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${theDealId}/loan/${loanId}`);
    return response.body;
  };

  const updateDeal = async (dealBody) => {
    const response = await as(aBarclaysMaker).put(dealBody).to(`/v1/deals/${dealId}`);
    return response.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);

    const dealResponse = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    deal = dealResponse.body;
    dealId = deal._id; 

    const loanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = loanResponse.body;
    loanId = _id;

    deal.loanTransactions = loanResponse.body.loanTransactions;
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    it('returns a loan with validationErrors for all required fields', async () => {
      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(body.validationErrors.count).toEqual(7);
      expect(body.validationErrors.errorList.facilityStage).toBeDefined();
      expect(body.validationErrors.errorList.value).toBeDefined();
      expect(body.validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
    });
  });

  describe('PUT /v1/deals/:id/loan/:loanId', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(7);
      expect(body.validationErrors.errorList.facilityStage).toBeDefined();
      expect(body.validationErrors.errorList.value).toBeDefined();
      expect(body.validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
    });

    describe('facilityStage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            facilityStage: '',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);

          expect(validationErrors.errorList.facilityStage.order).toBeDefined();
          expect(validationErrors.errorList.facilityStage.text).toEqual('Select the Facility stage');
        });
      });
    });

    describe('when facilityStage is `Conditional`', () => {
      describe('ukefGuaranteeInMonths', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Conditional',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Enter the Length of time that the UKEF\'s guarantee will be in place for');
          });
        });

        describe('when not numeric', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Conditional',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: 'test',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a number, like 1 or 12');
          });
        });

        describe('when contains decimal', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Conditional',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '6.3',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a whole number, like 12');
          });
        });

        describe('when less than 0', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Conditional',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '-1',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });

        describe('when greater than 999', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Conditional',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '1000',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });
      });
    });

    describe('when facilityStage is `Unconditional`', () => {
      describe('name', () => {
        describe('when is missing', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              name: '',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.name.order).toBeDefined();
            expect(validationErrors.errorList.name.text).toEqual('Enter the Bank reference number');
          });
        });

        describe('when has more than 30 characters', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              name: 'a'.repeat(31),
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.name.order).toBeDefined();
            expect(validationErrors.errorList.name.text).toEqual('Bank reference number must be 30 characters or fewer');
          });
        });
      });

      describe('requestedCoverStartDate', () => {
        const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
          const loan = {
            facilityStage: 'Unconditional',
            hasBeenIssued: true,
            ...requestedCoverStartDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(nowDate).format('DD'),
              'requestedCoverStartDate-month': '',
              'requestedCoverStartDate-year': '',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = dateValidationText(
              'Requested Cover Start Date',
              requestedCoverStartDateFields['requestedCoverStartDate-day'],
              requestedCoverStartDateFields['requestedCoverStartDate-month'],
              requestedCoverStartDateFields['requestedCoverStartDate-year'],
            );
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is before today', () => {
          it('should return validationError', async () => {
            const yesterday = moment().subtract(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(yesterday).format('DD'),
              'requestedCoverStartDate-month': moment(yesterday).format('MM'),
              'requestedCoverStartDate-year': moment(yesterday).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'Requested Cover Start Date must be today or in the future';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is 3 months or more', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDate = moment(nowDate).add(3, 'months').add(1, 'day');

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);

            expect(validationErrors.errorList.requestedCoverStartDate).toBeDefined();

            const expectedText = `Requested Cover Start Date must be between ${moment().format('Do MMMM YYYY')} and ${moment(nowDate).add(3, 'months').format('Do MMMM YYYY')}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        it('should not return validationError when eligibility criteria 15 answer is `false` and date is greater than 3 months', async () => {
          const dealWithEligibilityCriteria15False = {
            ...deal,
            eligibility: {
              criteria: [
                { id: 15, answer: false }
              ],
            },
          };

          await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

          const nowDate = moment();
          const requestedCoverStartDate = moment(nowDate).add(3, 'months').add(1, 'day');

          const requestedCoverStartDateFields = {
            'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
            'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
            'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
          };

          const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
          expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
        });

        describe('when the deal has already been submitted', () => {
          describe('when is before today', () => {
            it('should NOT return validationError', async () => {
              await updateDeal({
                ...newDeal,
                details: {
                  ...newDeal.details,
                  submissionDate: moment().utc().valueOf(),
                }
              });

              const beforeToday = moment().subtract(1, 'day');

              const requestedCoverStartDateFields = {
                'requestedCoverStartDate-day': moment(beforeToday).format('DD'),
                'requestedCoverStartDate-month': moment(beforeToday).format('MM'),
                'requestedCoverStartDate-year': moment(beforeToday).format('YYYY'),
              };

              const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
              expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
            });
          });

          describe('when is 3 months or more', () => {
            it('should NOT return validationError', async () => {
              await updateDeal({
                ...newDeal,
                details: {
                  ...newDeal.details,
                  submissionDate: moment().utc().valueOf(),
                }
              });

              const nowDate = moment();
              const requestedCoverStartDate = moment(nowDate).add(3, 'months').add(1, 'day');

              const requestedCoverStartDateFields = {
                'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
                'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
                'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              };

              const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);

              expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
            });
          });
        });
      });

      describe('coverEndDate', () => {
        const updateCoverEndDate = async (coverEndDate) => {
          const loan = {
            facilityStage: 'Unconditional',
            hasBeenIssued: true,
            ...coverEndDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when is missing', () => {
          it('should return validationError', async () => {
            const coverEndDateFields = {
              'coverEndDate-day': '',
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            expect(validationErrors.errorList.coverEndDate.text).toEqual('Enter the Cover End Date');
          });
        });

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const coverEndDateFields = {
              'coverEndDate-day': moment(nowDate).format('DD'),
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            const expectedText = dateValidationText(
              'Cover End Date',
              coverEndDateFields['coverEndDate-day'],
              coverEndDateFields['coverEndDate-month'],
              coverEndDateFields['coverEndDate-year'],
            );
            expect(validationErrors.errorList.coverEndDate.text).toEqual(expectedText);
          });
        });

        describe('when is before today', () => {
          it('should return validationError', async () => {
            const beforeToday = moment().subtract(1, 'day');

            const coverEndDateFields = {
              'coverEndDate-day': moment(beforeToday).format('DD'),
              'coverEndDate-month': moment(beforeToday).format('MM'),
              'coverEndDate-year': moment(beforeToday).format('YYYY'),
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate.order).toBeDefined();

            const expectedText = 'Cover End Date must be today or in the future';
            expect(validationErrors.errorList.coverEndDate.text).toEqual(expectedText);
          });
        });

        describe('when is before requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = moment(date).add(2, 'months');
            const coverEndDate = moment(date).add(2, 'months').subtract(1, 'day');

            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              'coverEndDate-day': moment(coverEndDate).format('DD'),
              'coverEndDate-month': moment(coverEndDate).format('MM'),
              'coverEndDate-year': moment(coverEndDate).format('YYYY'),
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.coverEndDate.order).toBeDefined();
            expect(body.validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date cannot be before Requested Cover Start Date');
          });
        });

        describe('when is same as requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = date;
            const coverEndDate = date;

            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              'coverEndDate-day': moment(coverEndDate).format('DD'),
              'coverEndDate-month': moment(coverEndDate).format('MM'),
              'coverEndDate-year': moment(coverEndDate).format('YYYY'),
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
            expect(body.validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date must be after the Requested Cover Start Date');
          });
        });
      });

      describe('disbursementAmount', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              disbursementAmount: '',
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
            expect(body.validationErrors.errorList.disbursementAmount.text).toEqual('Enter the Disbursement amount');
          });
        });

        describe('when not a number', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              disbursementAmount: '123test',
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
            expect(body.validationErrors.errorList.disbursementAmount.text).toEqual('Disbursement amount must be a currency format, like 1,345 or 1345.54');
          });
        });

        describe('when more than 2 decimals', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              disbursementAmount: '12.345',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
            expect(body.validationErrors.errorList.disbursementAmount.text).toEqual('Disbursement amount must have less than 3 decimals, like 12 or 12.65');
          });
        });

        describe('when less than 0.01', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              disbursementAmount: '0',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
            expect(body.validationErrors.errorList.disbursementAmount.text).toEqual('Disbursement amount must be more than 0.01');
          });
        });

        describe('when more than facility value', () => {
          it('should return validationError', async () => {
            const loan = {
              facilityStage: 'Unconditional',
              hasBeenIssued: true,
              value: '9',
              disbursementAmount: '9.10',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
            expect(body.validationErrors.errorList.disbursementAmount.text).toEqual(`Disbursement amount must be less than the Loan facility value (${loan.value})`);
          });
        });
      });
    });

    describe('facility value', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            value: '',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Enter the Loan facility value');
        });
      });

      describe('when not a number', () => {
        it('should return validationError', async () => {
          const loan = {
            value: 'test',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Loan facility value must be a currency format, like 1,345 or 1345.54');
        });
      });

      describe('when less than 0.01', () => {
        it('should return validationError', async () => {
          const loan = {
            value: '0',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Loan facility value must be 0.01 or more');
        });
      });

      describe('with more than 2 decimal points', () => {
        it('should return validationError', async () => {
          const loan = {
            value: '0.123',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Loan facility value must have less than 3 decimals, like 12 or 12.10');
        });
      });

      describe('with more than 14 digits and no decimal points', () => {
        it('should return validationError', async () => {
          const loan = {
            value: '123456789112345',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Loan facility value must be 14 numbers or fewer');
        });
      });

      describe('with more than 14 digits and decimal points', () => {
        it('should return validationError', async () => {
          const loan = {
            value: '123456789112345.12',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Loan facility value must be 14 numbers or fewer');
        });
      });
    });

    describe('currencySameAsSupplyContractCurrency', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            currencySameAsSupplyContractCurrency: '',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency.text).toEqual('Select if the currency for this Transaction is the same as your Supply Contract currency');
        });
      });
    });

    describe('when currencySameAsSupplyContractCurrency is false', () => {
      describe('conversionRate', () => {
        const updateBondConversionRate = async (conversionRate) => {
          const loan = {
            currencySameAsSupplyContractCurrency: 'false',
            conversionRate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when missing', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Enter the Conversion rate');
          });
        });

        describe('when not a number', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('test');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate must be a number, like 100 or 100.4');
          });
        });

        describe('with more than 12 characters', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1234567.123456');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate must be 12 numbers or fewer. You can include up to 6 decimal places as part of your number.');
          });
        });

        describe('with more than 6 characters as a whole number', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1234567');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate can only include up to 6 decimal places');
          });
        });

        describe('with more than 6 decimal places', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRate('1.1234567');
            expect(validationErrors.errorList.conversionRate).toBeDefined();
            expect(validationErrors.errorList.conversionRate.text).toEqual('Conversion rate can only include up to 6 decimal places');
          });
        });
      });

      describe('conversionRateDate', () => {
        const updateBondConversionRateDate = async (conversionRateDate) => {
          const loan = {
            currencySameAsSupplyContractCurrency: 'false',
            ...conversionRateDate,
          };

          const body = await updateLoanInDeal(dealId, loan);
          return body;
        };

        describe('when missing', () => {
          it('should return validationError', async () => {
            const { validationErrors } = await updateBondConversionRateDate({});
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();
            expect(validationErrors.errorList.conversionRateDate.text).toEqual('Enter the Conversion rate date');
          });
        });

        describe('when in the future', () => {
          it('should return validationError', async () => {
            const date = moment().add(1, 'day');
            const conversionRateFields = {
              'conversionRateDate-day': moment(date).format('DD'),
              'conversionRateDate-month': moment(date).format('MM'),
              'conversionRateDate-year': moment(date).format('YYYY'),
            };

            const { validationErrors } = await updateBondConversionRateDate(conversionRateFields);
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();
            expect(validationErrors.errorList.conversionRateDate.text).toEqual('Conversion rate date must be today or in the past');
          });
        });

        describe('when more than 30 days in the past', () => {
          it('should return validationError', async () => {
            const date = moment().subtract(30, 'day');
            const conversionRateFields = {
              'conversionRateDate-day': moment(date).format('DD'),
              'conversionRateDate-month': moment(date).format('MM'),
              'conversionRateDate-year': moment(date).format('YYYY'),
            };

            const { validationErrors } = await updateBondConversionRateDate(conversionRateFields);
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();
            const expectedText = `Conversion rate date must be between ${moment().subtract(29, 'day').format('Do MMMM YYYY')} and ${moment().format('Do MMMM YYYY')}`;
            expect(validationErrors.errorList.conversionRateDate.text).toEqual(expectedText);
          });
        });

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const date = moment().add(1, 'day');
            const conversionRateFields = {
              'conversionRateDate-day': moment(date).format('DD'),
              'conversionRateDate-month': '',
              'conversionRateDate-year': '',
            };

            const { validationErrors } = await updateBondConversionRateDate(conversionRateFields);
            expect(validationErrors.errorList.conversionRateDate).toBeDefined();

            const expectedText = dateValidationText(
              'Conversion rate date',
              conversionRateFields['conversionRateDate-day'],
              conversionRateFields['conversionRateDate-month'],
              conversionRateFields['conversionRateDate-year'],
            );

            expect(validationErrors.errorList.conversionRateDate.text).toEqual(expectedText);
          });
        });
      });

      describe('currency', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              currencySameAsSupplyContractCurrency: 'false',
              currency: '',
            };

            const { validationErrors } = await updateLoanInDeal(dealId, loan);
            expect(validationErrors.errorList.currency).toBeDefined();
            expect(validationErrors.errorList.currency.text).toEqual('Enter the Currency');
          });
        });
      });
    });

    describe('interestMarginFee', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            interestMarginFee: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.interestMarginFee.text).toEqual('Enter the Interest Margin %');
        });
      });

      describe('when not a number', () => {
        it('should return validationError', async () => {
          const loan = {
            interestMarginFee: '123test',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.interestMarginFee.text).toEqual('Interest Margin % must be a number, like 1 or 12.65');
        });
      });

      describe('when not between 0 and 99', () => {
        it('should return validationError', async () => {
          const loan = {
            interestMarginFee: '100',
          };

          let body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.interestMarginFee.text).toEqual('Interest Margin % must be between 0 and 99');

          loan.interestMarginFee = '-1';

          body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.interestMarginFee.text).toEqual('Interest Margin % must be between 0 and 99');
        });
      });

      describe('when more than 4 decimals', () => {
        it('should return validationError', async () => {
          const loan = {
            interestMarginFee: '60.12345',
          };

          const body = await updateLoanInDeal(dealId, loan);
          expect(body.validationErrors.errorList.interestMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.interestMarginFee.text).toEqual('Interest Margin % must have less than 5 decimals, like 12 or 12.0010');
        });
      });
    });

    describe('coveredPercentage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            coveredPercentage: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Enter the Covered Percentage');
        });
      });

      describe('when not between 1 and 99', () => {
        it('should return validationError', async () => {
          const loan = {
            coveredPercentage: '123test',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be a number, like 1 or 80');
        });
      });

      describe('when less than 1', () => {
        it('should return validationError', async () => {
          const loan = {
            coveredPercentage: '0.09',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when greater than 80', () => {
        it('should return validationError', async () => {
          const loan = {
            coveredPercentage: '81',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when has more 4 decimals', () => {
        it('should return validationError', async () => {
          const loan = {
            coveredPercentage: '12.34567',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must have less than 5 decimals, like 12 or 12.3456');
        });
      });
    });

    describe('minimumQuarterlyFee', () => {
      describe('when not a number', () => {
        it('should return validationError', async () => {
          const loan = {
            minimumQuarterlyFee: 'test',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.minimumQuarterlyFee).toBeDefined();
          expect(validationErrors.errorList.minimumQuarterlyFee.text).toEqual('Minimum quarterly fee must be a number, like 12 or 12.65');
        });
      });

      describe('when less than 0', () => {
        it('should return validationError', async () => {
          const loan = {
            minimumQuarterlyFee: '-1',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.minimumQuarterlyFee).toBeDefined();
          expect(validationErrors.errorList.minimumQuarterlyFee.text).toEqual('Minimum quarterly fee must be 0 or more');
        });
      });

      describe('with more than 14 digits and no decimal points', () => {
        it('should return validationError', async () => {
          const loan = {
            minimumQuarterlyFee: '123456789112345',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.minimumQuarterlyFee).toBeDefined();
          expect(validationErrors.errorList.minimumQuarterlyFee.text).toEqual('Minimum quarterly fee must be 14 numbers or fewer');
        });
      });

      describe('with more than 14 digits and decimal points', () => {
        it('should return validationError', async () => {
          const loan = {
            minimumQuarterlyFee: '123456789112345.12',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.minimumQuarterlyFee).toBeDefined();
          expect(validationErrors.errorList.minimumQuarterlyFee.text).toEqual('Minimum quarterly fee must be 14 numbers or fewer');
        });
      });

      describe('when has more than 2 decimal places', () => {
        it('should return validationError', async () => {
          const loan = {
            minimumQuarterlyFee: '12.345',
          };

          const { validationErrors } = await updateLoanInDeal(dealId, loan);
          expect(validationErrors.errorList.minimumQuarterlyFee).toBeDefined();
          expect(validationErrors.errorList.minimumQuarterlyFee.text).toEqual('Minimum quarterly fee must have less than 3 decimals, like 12 or 12.10');
        });
      });
    });

    describe('premiumType', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            premiumType: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.premiumType).toBeDefined();
          expect(body.validationErrors.errorList.premiumType.text).toEqual('Enter the Premium type');
        });
      });

      describe('when premiumType is `In advance`', () => {
        it('should return validationError for premiumFrequency', async () => {
          const loan = {
            premiumType: 'In advance',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.premiumFrequency).toBeDefined();
          expect(body.validationErrors.errorList.premiumFrequency.text).toEqual('Enter the Premium frequency');
        });
      });

      describe('when premiumType as `In arrear`', () => {
        it('should return validationError for premiumFrequency', async () => {
          const loan = {
            premiumType: 'In arrear',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.premiumFrequency).toBeDefined();
          expect(body.validationErrors.errorList.premiumFrequency.text).toEqual('Enter the Premium frequency');
        });
      });
    });

    describe('dayCountBasis', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            dayCountBasis: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.dayCountBasis).toBeDefined();
          expect(body.validationErrors.errorList.dayCountBasis.text).toEqual('Enter the Day count basis');
        });
      });
    });
  });
});

const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/date-field');

describe('/v1/deals/:id/loan', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  const allLoanFields = {
    facilityStage: 'Conditional',
    ukefGuaranteeLengthInMonths: '12',
  };

  let aBarclaysMaker;
  let dealId;
  let loanId;

  const updateLoanInDeal = async (theDealId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${theDealId}/loan/${loanId}`);
    return response.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const loanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = loanResponse.body;
    loanId = _id;
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    it('returns a loan with validationErrors for all required fields', async () => {
      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(body.validationErrors.count).toEqual(1);
    });
  });

  describe('PUT /v1/deals/:id/loan/:loanId', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(1);
    });

    describe('bankReferenceNumber', () => {
      describe('when has more than 30 characters', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            bankReferenceNumber: 'a'.repeat(31),
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
          expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Bank reference number must be 30 characters or fewer');
        });
      });
    });

    describe('facilityStage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const loan = {
            ...allLoanFields,
            facilityStage: '',
          };

          const body = await updateLoanInDeal(dealId, loan);

          expect(body.validationErrors.errorList.facilityStage.order).toBeDefined();
          expect(body.validationErrors.errorList.facilityStage.text).toEqual('Select the Facility stage');
        });
      });
    });

    describe('when facilityStage is `Conditional`', () => {
      describe('ukefGuaranteeLengthInMonths', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeLengthInMonths: '',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.text).toEqual('Enter the Length of time that the UKEF\'s guarantee will be in place for');
          });
        });

        describe('when not numeric', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeLengthInMonths: 'test',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a number, like 1 or 12');
          });
        });

        describe('when contains decimal', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Conditional',
              ukefGuaranteeLengthInMonths: '6.3',
            };

            const body = await updateLoanInDeal(dealId, loan);
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeLengthInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a whole number, like 12');
          });
        });
      });
    });

    describe('when facilityStage is `Unconditional`', () => {
      describe('bankReferenceNumber', () => {
        describe('when is missing', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
              bankReferenceNumber: '',
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
            expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Enter the Bank reference number');
          });
        });

        describe('when has more than 30 characters', () => {
          it('should return validationError', async () => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
              bankReferenceNumber: 'a'.repeat(31),
            };

            const body = await updateLoanInDeal(dealId, loan);

            expect(body.validationErrors.errorList.bankReferenceNumber.order).toBeDefined();
            expect(body.validationErrors.errorList.bankReferenceNumber.text).toEqual('Bank reference number must be 30 characters or fewer');
          });
        });
      });

      describe('requestedCoverStartDate', () => {
        const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
          const loan = {
            ...allLoanFields,
            facilityStage: 'Unconditional',
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
            const nowDate = moment();
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(nowDate).subtract(1, 'day').format('DD'),
              'requestedCoverStartDate-month': moment(nowDate).format('MM'),
              'requestedCoverStartDate-year': moment(nowDate).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'Requested Cover Start Date must be today or in the future';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is before requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = moment(date).add(2, 'months');
            const coverEndDate = moment(date).add(2, 'months').subtract(1, 'day');

            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
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
      });

      describe('coverEndDate', () => {
        describe('requestedCoverStartDate', () => {
          const updateCoverEndDate = async (coverEndDate) => {
            const loan = {
              ...allLoanFields,
              facilityStage: 'Unconditional',
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
        });
      });
    });
  });
});

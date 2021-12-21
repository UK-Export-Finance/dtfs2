const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');
const { formattedTimestamp } = require('../../../src/v1/facility-dates/timestamp');

describe('/v1/deals/:id/loan/:loanId', () => {
  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Acknowledged by UKEF',
    details: {
      submissionDate: moment().utc().valueOf(),
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
  });

  let aBarclaysMaker;
  let deal;
  let dealId;
  let loanId;

  const updateDeal = async (dealId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}`);
    return result.body;
  };

  const updateLoan = async (dealId, loanId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/loan/${loanId}`);
    return result.body;
  };

  const updateLoanCoverStartDate = async (theDealId, loanId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${theDealId}/loan/${loanId}/change-cover-start-date`);
    return response.body;
  };

  const createDealAndLoan = async () => {
    const dealResponse = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    deal = dealResponse.body;
    dealId = deal._id; // eslint-disable-line no-underscore-dangle

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = createLoanResponse.body;

    loanId = _id;

    const getCreatedLoan = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

    const modifiedLoan = {
      ...getCreatedLoan.body.loan,
      facilityStage: 'Unconditional',
    };

    const updatedLoan = await updateLoan(dealId, loanId, modifiedLoan);

    return updatedLoan.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('PUT /v1/deals/:id/loan/:loanId/change-cover-start-date', () => {
    describe('requestedCoverStartDate', () => {
      let createdLoan;

      const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
        const loan = {
          ...createdLoan,
          ...requestedCoverStartDate,
        };

        const body = await updateLoanCoverStartDate(dealId, loanId, loan);
        return body;
      };

      describe('when has some values', () => {
        beforeEach(async () => {
          await createDealAndLoan();
        });

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

      describe('when deal is AIN', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Automatic Inclusion Notice',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(2, 'day').utc().valueOf()
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when requestedCoverStartDate is before deal submission date', () => {
          it('should return validationError', async () => {
            const aWeekAgo = moment().subtract(1, 'week');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(aWeekAgo).format('DD'),
              'requestedCoverStartDate-month': moment(aWeekAgo).format('MM'),
              'requestedCoverStartDate-year': moment(aWeekAgo).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = moment(formattedTimestamp(updatedDeal.details.submissionDate)).format('Do MMMM YYYY');
            const expectedText = `Requested Cover Start Date must be after ${formattedSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from today', () => {
          it('should return validationError', async () => {
            const todayPlus3Months = moment().add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = moment(formattedTimestamp(updatedDeal.details.submissionDate)).format('Do MMMM YYYY');
            const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${formattedSubmissionDate} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });
      });

      describe('when deal is MIA with approved deal status', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Application',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(1, 'week').utc().valueOf(),
              manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
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

            const todayPlus3Months = moment().add(3, 'month');
            const todayFormatted = moment().format('Do MMMM YYYY');
            const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${todayFormatted} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const todayPlus3Months = moment().add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const todayFormatted = moment().format('Do MMMM YYYY');
            const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${todayFormatted} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [
                  { id: 15, answer: false }
                ],
              },
            };

            const todayPlus3Months = moment().add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

            const response = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(response.validationErrors).toBeUndefined();
          });
        });
      });

      describe('when deal is MIN with approved status', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Notice',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(1, 'week').utc().valueOf(),
              manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when requestedCoverStartDate is before the deal\'s manual inclusion notice submission date', () => {
          it('should return validationError', async () => {
            const threeDaysAgo = moment().subtract(3, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(threeDaysAgo).format('DD'),
              'requestedCoverStartDate-month': moment(threeDaysAgo).format('MM'),
              'requestedCoverStartDate-year': moment(threeDaysAgo).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = moment(formattedTimestamp(updatedDeal.details.manualInclusionNoticeSubmissionDate)).format('Do MMMM YYYY');
            const expectedText = `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const todayPlus3Months = moment().add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = moment(formattedTimestamp(updatedDeal.details.manualInclusionNoticeSubmissionDate)).format('Do MMMM YYYY');
            const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [
                  { id: 15, answer: false }
                ],
              },
            };

            const todayPlus3Months = moment().add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

            const response = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(response.validationErrors).toBeUndefined();
          });
        });
      });
    });
  });
});

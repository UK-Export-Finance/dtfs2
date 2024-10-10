const { sub, format, add } = require('date-fns');
const aDeal = require('../deals/deal-builder');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');
const { MAKER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { DATE_FORMATS } = require('../../../src/constants');

describe('/v1/deals/:id/loan/:loanId/issue-facility', () => {
  const nowDate = new Date();
  const submissionDateAWeekago = sub(nowDate, { weeks: 1 });

  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Acknowledged',
    details: {
      submissionDate: submissionDateAWeekago.valueOf(),
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

  const updateDeal = async (bssDealId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}`);
    return result.body;
  };

  const updateLoan = async (bssDealId, bssLoanId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}/loan/${bssLoanId}`);
    return result.body;
  };

  const updateLoanIssuance = async (bssDealId, bssLoanId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${bssDealId}/loan/${bssLoanId}/issue-facility`);
    return response.body;
  };

  const createDealAndLoan = async () => {
    const dealResponse = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    deal = dealResponse.body;
    dealId = deal._id;

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = createLoanResponse.body;

    loanId = _id;

    const getCreatedLoan = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

    const modifiedLoan = {
      ...getCreatedLoan.body.loan,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
    };

    const updatedLoan = await updateLoan(dealId, loanId, modifiedLoan);

    return updatedLoan.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('PUT /v1/deals/:id/loan/:loanId/issue-facility', () => {
    it('returns 400 with validation errors', async () => {
      await createDealAndLoan();

      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/issue-facility`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(4);
      expect(body.validationErrors.errorList.issuedDate).toBeDefined();
      expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
      expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
      expect(body.validationErrors.errorList.name).toBeDefined();
    });

    describe('issuedDate', () => {
      const updateIssuedDate = async (issuedDate) => {
        const loan = {
          ...issuedDate,
        };

        const body = await updateLoanIssuance(dealId, loanId, loan);
        return body;
      };

      describe('when has some values', () => {
        it('should return validationError', async () => {
          await createDealAndLoan();

          const issuedDateFields = {
            'issuedDate-day': format(nowDate, 'dd'),
            'issuedDate-month': '',
            'issuedDate-year': '',
          };

          const { validationErrors } = await updateIssuedDate(issuedDateFields);
          expect(validationErrors.errorList.issuedDate.order).toBeDefined();

          const expectedText = dateValidationText(
            'Issued Date',
            issuedDateFields['issuedDate-day'],
            issuedDateFields['issuedDate-month'],
            issuedDateFields['issuedDate-year'],
          );
          expect(validationErrors.errorList.issuedDate.text).toEqual(expectedText);
        });
      });

      describe('when issuedDate is not after the deal submission date', () => {
        it('should return validationError', async () => {
          await createDealAndLoan();

          const beforeSubmissionDate = sub(submissionDateAWeekago, { weeks: 1 });
          const issuedDateFields = {
            'issuedDate-day': format(beforeSubmissionDate, 'dd'),
            'issuedDate-month': format(beforeSubmissionDate, 'MM'),
            'issuedDate-year': format(beforeSubmissionDate, 'yyyy'),
          };

          const { validationErrors } = await updateIssuedDate(issuedDateFields);
          expect(validationErrors.errorList.issuedDate.order).toBeDefined();

          const formattedNowDate = format(nowDate, 'do MMMM yyyy');
          const expectedText = `Issued Date must be on or after ${formattedNowDate}`;
          expect(validationErrors.errorList.issuedDate.text).toEqual(expectedText);
        });
      });

      describe('when issuedDate is after today', () => {
        it('should return validationError', async () => {
          await createDealAndLoan();

          const tomorrow = add(nowDate, { days: 1 });
          const issuedDateFields = {
            'issuedDate-day': format(tomorrow, 'dd'),
            'issuedDate-month': format(tomorrow, 'MM'),
            'issuedDate-year': format(tomorrow, 'yyyy'),
          };

          const { validationErrors } = await updateIssuedDate(issuedDateFields);
          expect(validationErrors.errorList.issuedDate.order).toBeDefined();

          const expectedText = 'Issued Date must be today or in the past';
          expect(validationErrors.errorList.issuedDate.text).toEqual(expectedText);
        });
      });
    });

    describe('requestedCoverStartDate', () => {
      let createdLoan;
      const todayPlus3Months1Day = add(nowDate, { months: 3, days: 1 });

      const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
        const loan = {
          ...createdLoan,
          ...requestedCoverStartDate,
        };

        const body = await updateLoanIssuance(dealId, loanId, loan);
        return body;
      };

      describe('when has some values', () => {
        beforeEach(async () => {
          await createDealAndLoan();
        });

        it('should return validationError', async () => {
          const requestedCoverStartDateFields = {
            'requestedCoverStartDate-day': format(nowDate, 'dd'),
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

        describe('when requestedCoverStartDate year is not 4 numbers', () => {
          it('should return validationError', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': '23',
              'requestedCoverStartDate-month': '09',
              'requestedCoverStartDate-year': '22',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'The year for the requested Cover Start Date must include 4 numbers';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });
      });

      describe('when deal is AIN', () => {
        let updatedDeal;
        const submissionDateTwoDaysAgo = sub(nowDate, { days: 2 });

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Automatic Inclusion Notice',
            details: {
              ...newDeal.details,
              submissionDate: submissionDateTwoDaysAgo.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when requestedCoverStartDate is before deal submission date', () => {
          it('should return validationError', async () => {
            const aWeekAgo = sub(nowDate, { weeks: 1 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(aWeekAgo, 'dd'),
              'requestedCoverStartDate-month': format(aWeekAgo, 'MM'),
              'requestedCoverStartDate-year': format(aWeekAgo, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = format(submissionDateTwoDaysAgo, DATE_FORMATS.LONG_FORM_DATE);
            const expectedText = `Requested Cover Start Date must be after ${formattedSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate year is not 4 numbers', () => {
          it('should return validationError', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': '23',
              'requestedCoverStartDate-month': '09',
              'requestedCoverStartDate-year': '22',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'The year for the requested Cover Start Date must include 4 numbers';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from today', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = add(submissionDateTwoDaysAgo, { months: 3 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = format(submissionDateTwoDaysAgo, DATE_FORMATS.LONG_FORM_DATE);
            const submissionPlus3MonthsFormatted = format(submissionPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${formattedSubmissionDate} and ${submissionPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
              specialIssuePermission: true,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is AIN and cover starts on submission', () => {
        let updatedDeal;
        const submissionDateFourMonthsAgo = sub(nowDate, { months: 4 });

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Automatic Inclusion Notice',
            details: {
              ...newDeal.details,
              submissionDate: submissionDateFourMonthsAgo.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when requestedCoverStartDate is after 3 months from submission date', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = add(submissionDateFourMonthsAgo, { months: 3 });
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = format(submissionDateFourMonthsAgo, DATE_FORMATS.LONG_FORM_DATE);
            const submissionPlus3MonthsFormatted = format(submissionPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${formattedSubmissionDate} and ${submissionPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
              specialIssuePermission: true,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is MIA with approved deal status', () => {
        let updatedDeal;
        const miaSubmissionDate = sub(nowDate, { days: 4 });
        const minSubmissionDate = sub(nowDate, { days: 2 });

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Application',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: submissionDateAWeekago.valueOf(),
              manualInclusionApplicationSubmissionDate: miaSubmissionDate.valueOf(),
              manualInclusionNoticeSubmissionDate: minSubmissionDate.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when is before manualInclusionApplicationSubmissionDate', () => {
          it('should return validationError', async () => {
            const fiveDaysAgo = sub(nowDate, { days: 5 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(fiveDaysAgo, 'dd'),
              'requestedCoverStartDate-month': format(fiveDaysAgo, 'MM'),
              'requestedCoverStartDate-year': format(fiveDaysAgo, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const todayFormatted = format(nowDate, DATE_FORMATS.LONG_FORM_DATE);
            const todayPlus3Months = add(nowDate, { months: 3 });
            const todayPlus3MonthsFormatted = format(todayPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${todayFormatted} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate year is not 4 numbers', () => {
          it('should return validationError', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': '23',
              'requestedCoverStartDate-month': '09',
              'requestedCoverStartDate-year': '22',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'The year for the requested Cover Start Date must include 4 numbers';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const todayPlus3Months = add(nowDate, { months: 3 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const todayFormatted = format(nowDate, DATE_FORMATS.LONG_FORM_DATE);
            const todayPlus3MonthsFormatted = format(todayPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${todayFormatted} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [{ id: 15, answer: false }],
              },
            };

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is MIN with approved status', () => {
        let updatedDeal;
        const minSubmissionDate = sub(nowDate, { days: 2 });

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Notice',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: submissionDateAWeekago.valueOf(),
              manualInclusionNoticeSubmissionDate: minSubmissionDate.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe("when requestedCoverStartDate is before the deal's manual inclusion notice submission date", () => {
          it('should return validationError', async () => {
            const threeDaysAgo = sub(nowDate, { days: 3 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': threeDaysAgo.dayLong,
              'requestedCoverStartDate-month': threeDaysAgo.monthLong,
              'requestedCoverStartDate-year': threeDaysAgo.year,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = format(minSubmissionDate, DATE_FORMATS.LONG_FORM_DATE);
            const expectedText = `Requested Cover Start Date must be after ${formattedManualInclusionNoticeSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate year is not 4 numbers', () => {
          it('should return validationError', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': '23',
              'requestedCoverStartDate-month': '09',
              'requestedCoverStartDate-year': '22',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const expectedText = 'The year for the requested Cover Start Date must include 4 numbers';
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const minPlus3Months = add(minSubmissionDate, { months: 3 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = format(minSubmissionDate, DATE_FORMATS.LONG_FORM_DATE);
            const minPlus3MonthsFormatted = format(minPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${minPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
              specialIssuePermission: true,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [{ id: 15, answer: false }],
              },
            };

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is MIN with approved status and cover starts on submission', () => {
        let updatedDeal;
        const submissionDateFourMonthsAgo = sub(nowDate, { months: 4 });

        beforeEach(async () => {
          await createDealAndLoan();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Notice',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: submissionDateFourMonthsAgo.valueOf(),
              manualInclusionNoticeSubmissionDate: submissionDateFourMonthsAgo.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = add(submissionDateFourMonthsAgo, { months: 3 });
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = format(submissionDateFourMonthsAgo, DATE_FORMATS.LONG_FORM_DATE);
            const submissionPlus3MonthsFormatted = format(submissionPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${submissionPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
              specialIssuePermission: true,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [{ id: 15, answer: false }],
              },
            };

            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealId}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });
    });
  });
});

const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');
const { formattedTimestamp } = require('../../../src/v1/facility-dates/timestamp');
const { MAKER } = require('../../../src/v1/roles/roles');

describe('/v1/deals/:id/bond/:bondId/change-cover-start-date', () => {
  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Acknowledged',
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
  let bondId;

  const updateDeal = async (bssDealId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}`);
    return result.body;
  };

  const updateBond = async (bssDealId, bssBondId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}/bond/${bssBondId}`);
    return result.body;
  };

  const updateBondCoverStartDate = async (theDealId, bssBondId, bond) => {
    const response = await as(aBarclaysMaker)
      .put(bond)
      .to(`/v1/deals/${theDealId}/bond/${bssBondId}/change-cover-start-date`);
    return response.body;
  };

  const createDealAndBond = async () => {
    const dealResponse = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    deal = dealResponse.body;
    dealId = deal._id;

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    const { bondId: _id } = createBondResponse.body;

    bondId = _id;

    const getCreatedBond = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

    const modifiedBond = {
      ...getCreatedBond.body.bond,
      facilityStage: 'Issued',
      hasBeenIssued: true,
    };

    const updatedBond = await updateBond(dealId, bondId, modifiedBond);

    return updatedBond.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe(['deals']);
    await databaseHelper.wipe(['facilities']);
  });

  describe('PUT /v1/deals/:id/bond/:bondId/change-cover-start-date', () => {
    describe('requestedCoverStartDate', () => {
      let createdBond;

      const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
        const bond = {
          ...createdBond,
          ...requestedCoverStartDate,
        };

        const body = await updateBondCoverStartDate(dealId, bondId, bond);
        return body;
      };

      describe('when has some values', () => {
        beforeEach(async () => {
          await createDealAndBond();
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
          await createDealAndBond();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Automatic Inclusion Notice',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(2, 'day').utc().valueOf(),
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

            const formattedSubmissionDate = moment(formattedTimestamp(updatedDeal.details.submissionDate)).format(
              'Do MMMM YYYY',
            );
            const expectedText = `Requested Cover Start Date must be after ${formattedSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from today', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = moment(updatedDeal.details.submissionDate).add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = moment(formattedTimestamp(updatedDeal.details.submissionDate)).format(
              'Do MMMM YYYY',
            );
            const submissionPlus3MonthsFormatted = moment(submissionPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${formattedSubmissionDate} and ${submissionPlus3MonthsFormatted}`;
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
      });

      describe('when deal is MIA with approved deal status', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndBond();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Application',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(1, 'week').utc().valueOf(),
              manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
              manualInclusionApplicationSubmissionDate: moment().subtract(3, 'day').utc().valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when is before today', () => {
          it('should return validationError if before manualInclusionNoticeSubmissionDate', async () => {
            const fourDaysAgo = moment().subtract(4, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(fourDaysAgo).format('DD'),
              'requestedCoverStartDate-month': moment(fourDaysAgo).format('MM'),
              'requestedCoverStartDate-year': moment(fourDaysAgo).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const todayPlus3Months = moment().add(3, 'month');
            const today = moment().utc().valueOf();
            const todayFormatted = moment(today).format('Do MMMM YYYY');
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

            const today = moment().utc().valueOf();
            const todayFormatted = moment(today).format('Do MMMM YYYY');
            const todayPlus3MonthsFormatted = moment(todayPlus3Months).format('Do MMMM YYYY');

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

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...updatedDeal,
              eligibility: {
                criteria: [{ id: 15, answer: false }],
              },
            };

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
          await createDealAndBond();

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

        describe("when requestedCoverStartDate is before the deal's manual inclusion notice submission date", () => {
          it('should return validationError', async () => {
            const threeDaysAgo = moment().subtract(3, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(threeDaysAgo).format('DD'),
              'requestedCoverStartDate-month': moment(threeDaysAgo).format('MM'),
              'requestedCoverStartDate-year': moment(threeDaysAgo).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = moment(
              formattedTimestamp(updatedDeal.details.manualInclusionNoticeSubmissionDate),
            ).format('Do MMMM YYYY');
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
            const minPlus3Months = moment(updatedDeal.details.manualInclusionNoticeSubmissionDate).add(3, 'month');
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = moment(
              formattedTimestamp(updatedDeal.details.manualInclusionNoticeSubmissionDate),
            ).format('Do MMMM YYYY');
            const minPlus3MonthsFormatted = moment(minPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${minPlus3MonthsFormatted}`;
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

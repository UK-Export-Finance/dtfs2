const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');
const { formattedTimestamp } = require('../../../src/v1/facility-dates/timestamp');
const { MAKER } = require('../../../src/v1/roles/roles');

describe('/v1/deals/:id/bond/:bondId/issue-facility', () => {
  const submissionDate = moment().subtract(1, 'week');

  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Acknowledged',
    details: {
      submissionDate: moment(submissionDate).utc().valueOf(),
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
  });

  let aBarclaysMaker;
  let deal;
  let dealID;
  let bondID;

  const updateDeal = async (dealId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}`);
    return result.body;
  };

  const updateBond = async (dealId, bondId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/bond/${bondId}`);
    return result.body;
  };

  const updateBondIssuance = async (dealId, bondId, bond) => {
    const response = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}/issue-facility`);
    return response.body;
  };

  const createDealAndBond = async () => {
    const dealResponse = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    deal = dealResponse.body;
    dealID = deal._id;

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealID}/bond/create`);
    const { bondId: _id } = createBondResponse.body;

    bondID = _id;

    const getCreatedBond = await as(aBarclaysMaker).get(`/v1/deals/${dealID}/bond/${bondID}`);

    const modifiedBond = {
      ...getCreatedBond.body.bond,
      facilityStage: 'Conditional',
      hasBeenIssued: false,
    };

    const updatedBond = await updateBond(dealID, bondID, modifiedBond);

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

  describe('PUT /v1/deals/:id/bond/:bondId/issue-facility', () => {
    it('returns 400 with validation errors', async () => {
      await createDealAndBond();

      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealID}/bond/${bondID}/issue-facility`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(3);
      expect(body.validationErrors.errorList.issuedDate).toBeDefined();
      expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
      expect(body.validationErrors.errorList.name).toBeDefined();
    });

    describe('issuedDate', () => {
      const updateIssuedDate = async (issuedDate) => {
        const bond = {
          ...issuedDate,
        };

        const body = await updateBondIssuance(dealID, bondID, bond);
        return body;
      };

      describe('when has some values', () => {
        it('should return validationError', async () => {
          await createDealAndBond();

          const nowDate = moment();
          const issuedDateFields = {
            'issuedDate-day': moment(nowDate).format('DD'),
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
          await createDealAndBond();

          const beforeSubmissionDate = moment(submissionDate).subtract(1, 'week');
          const issuedDateFields = {
            'issuedDate-day': moment(beforeSubmissionDate).format('DD'),
            'issuedDate-month': moment(beforeSubmissionDate).format('MM'),
            'issuedDate-year': moment(beforeSubmissionDate).format('YYYY'),
          };

          const { validationErrors } = await updateIssuedDate(issuedDateFields);
          expect(validationErrors.errorList.issuedDate.order).toBeDefined();

          const formattedSubmissionDate = moment(formattedTimestamp(moment().utc().valueOf())).format('Do MMMM YYYY');
          const expectedText = `Issued Date must be on or after ${formattedSubmissionDate}`;
          expect(validationErrors.errorList.issuedDate.text).toEqual(expectedText);
        });
      });

      describe('when issuedDate is after today', () => {
        it('should return validationError', async () => {
          await createDealAndBond();

          const tomorrow = moment().add(1, 'day');
          const issuedDateFields = {
            'issuedDate-day': moment(tomorrow).format('DD'),
            'issuedDate-month': moment(tomorrow).format('MM'),
            'issuedDate-year': moment(tomorrow).format('YYYY'),
          };

          const { validationErrors } = await updateIssuedDate(issuedDateFields);
          expect(validationErrors.errorList.issuedDate.order).toBeDefined();

          const expectedText = 'Issued Date must be today or in the past';
          expect(validationErrors.errorList.issuedDate.text).toEqual(expectedText);
        });
      });
    });

    describe('requestedCoverStartDate', () => {
      const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
        const bond = {
          ...requestedCoverStartDate,
        };

        const body = await updateBondIssuance(dealID, bondID, bond);
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

          await updateDeal(dealID, updatedDeal);
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

        describe('when requestedCoverStartDate is after 3 months from submission date', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = moment().subtract(2, 'day').add(3, 'month');
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

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
              specialIssuePermission: true,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is AIN and cover starts on submission', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndBond();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Automatic Inclusion Notice',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(4, 'month').utc().valueOf(),
            },
          };

          await updateDeal(dealID, updatedDeal);
        });

        describe('when requestedCoverStartDate is after 3 months from submission date', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = moment().subtract(4, 'month').add(3, 'month');
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
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

        beforeEach(async () => {
          await createDealAndBond();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Application',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(1, 'week').utc().valueOf(),
              manualInclusionApplicationSubmissionDate: moment().subtract(4, 'day').utc().valueOf(),
              manualInclusionNoticeSubmissionDate: moment().subtract(2, 'day').utc().valueOf(),
            },
          };

          await updateDeal(dealID, updatedDeal);
        });

        describe('when is before manualInclusionApplicationSubmissionDate', () => {
          it('should return validationError', async () => {
            const fiveDaysAgo = moment().subtract(5, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(fiveDaysAgo).format('DD'),
              'requestedCoverStartDate-month': moment(fiveDaysAgo).format('MM'),
              'requestedCoverStartDate-year': moment(fiveDaysAgo).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const today = moment().utc().valueOf();
            const todayFormatted = moment(today).format('Do MMMM YYYY');
            const todayPlus3Months = moment().add(3, 'month');
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

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealID}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
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

          await updateDeal(dealID, updatedDeal);
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
            const submissionPlus3Months = moment().subtract(2, 'day').add(3, 'month');
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
            const submissionPlus3MonthsFormatted = moment(submissionPlus3Months).format('Do MMMM YYYY');

            const expectedText = `Requested Cover Start Date must be between ${formattedManualInclusionNoticeSubmissionDate} and ${submissionPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from submission date but has special issue permission', () => {
          it('should not return validationError for coverStartDate', async () => {
            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
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

            const todayPlus3Months1Day = moment().add(3, 'month').add(1, 'day');
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(todayPlus3Months1Day).format('DD'),
              'requestedCoverStartDate-month': moment(todayPlus3Months1Day).format('MM'),
              'requestedCoverStartDate-year': moment(todayPlus3Months1Day).format('YYYY'),
            };

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealID}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });

      describe('when deal is MIN with approved status and cover starts on submission', () => {
        let updatedDeal;

        beforeEach(async () => {
          await createDealAndBond();

          updatedDeal = {
            ...newDeal,
            submissionType: 'Manual Inclusion Notice',
            status: 'Accepted by UKEF (without conditions)',
            details: {
              ...newDeal.details,
              submissionDate: moment().subtract(4, 'month').utc().valueOf(),
              manualInclusionNoticeSubmissionDate: moment().subtract(4, 'month').utc().valueOf(),
            },
          };

          await updateDeal(dealID, updatedDeal);
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
            const submissionPlus3Months = moment().subtract(4, 'month').add(3, 'month');
            const requestedCoverStartDateFields = {
              requestedCoverStartDate: null,
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedManualInclusionNoticeSubmissionDate = moment(
              formattedTimestamp(updatedDeal.details.manualInclusionNoticeSubmissionDate),
            ).format('Do MMMM YYYY');
            const submissionPlus3MonthsFormatted = moment(submissionPlus3Months).format('Do MMMM YYYY');

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

            await as(aBarclaysMaker).put(dealWithEligibilityCriteria15False).to(`/v1/deals/${dealID}`);

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeUndefined();
          });
        });
      });
    });
  });
});

const { format, sub, add } = require('date-fns');
const aDeal = require('../deals/deal-builder');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');
const { MAKER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { DATE_FORMATS } = require('../../../src/constants');
const { getStartOfDateFromEpochMillisecondString } = require('../../../src/v1/helpers/date');

describe('/v1/deals/:id/bond/:bondId/change-cover-start-date', () => {
  const nowDate = new Date();
  const todayPlus3Months1Day = add(nowDate, { months: 3, days: 1 });
  const todayPlus3Months = add(nowDate, { months: 3 });
  const twoDaysAgo = sub(nowDate, { days: 2 });
  const aWeekAgo = sub(nowDate, { weeks: 1 });

  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: 'Acknowledged',
    details: {
      submissionDate: nowDate.valueOf(),
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
    const response = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${theDealId}/bond/${bssBondId}/change-cover-start-date`);
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
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
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
              submissionDate: twoDaysAgo.valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when requestedCoverStartDate is before deal submission date', () => {
          it('should return validationError', async () => {
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(aWeekAgo, 'dd'),
              'requestedCoverStartDate-month': format(aWeekAgo, 'MM'),
              'requestedCoverStartDate-year': format(aWeekAgo, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const submissionDate = getStartOfDateFromEpochMillisecondString(updatedDeal.details.submissionDate);
            const formattedSubmissionDate = format(submissionDate, DATE_FORMATS.LONG_FORM_DATE);
            const expectedText = `Requested Cover Start Date must be after ${formattedSubmissionDate}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when requestedCoverStartDate is after 3 months from today', () => {
          it('should return validationError', async () => {
            const submissionDate = getStartOfDateFromEpochMillisecondString(updatedDeal.details.submissionDate);
            const submissionPlus3Months = add(submissionDate, { months: 3 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const formattedSubmissionDate = format(submissionDate, DATE_FORMATS.LONG_FORM_DATE);
            const submissionPlus3MonthsFormatted = format(submissionPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

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
              submissionDate: aWeekAgo.valueOf(),
              manualInclusionNoticeSubmissionDate: twoDaysAgo.valueOf(),
              manualInclusionApplicationSubmissionDate: sub(nowDate, { days: 3 }).valueOf(),
            },
          };

          await updateDeal(dealId, updatedDeal);
        });

        describe('when is before today', () => {
          it('should return validationError if before manualInclusionNoticeSubmissionDate', async () => {
            const fourDaysAgo = sub(nowDate, { days: 4 });
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(fourDaysAgo, 'dd'),
              'requestedCoverStartDate-month': format(fourDaysAgo, 'MM'),
              'requestedCoverStartDate-year': format(fourDaysAgo, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

            const todayFormatted = format(nowDate, DATE_FORMATS.LONG_FORM_DATE);
            const todayPlus3MonthsFormatted = format(todayPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const expectedText = `Requested Cover Start Date must be between ${todayFormatted} and ${todayPlus3MonthsFormatted}`;
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });

        describe('when is after 3 months from today', () => {
          it('should return validationError', async () => {
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

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
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
              submissionDate: aWeekAgo.valueOf(),
              manualInclusionNoticeSubmissionDate: twoDaysAgo.valueOf(),
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

            const manualInclusionApplicationSubmissionDate = getStartOfDateFromEpochMillisecondString(updatedDeal.details.manualInclusionNoticeSubmissionDate);
            const formattedManualInclusionNoticeSubmissionDate = format(manualInclusionApplicationSubmissionDate, DATE_FORMATS.LONG_FORM_DATE);
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
            const manualInclusionApplicationSubmissionDate = getStartOfDateFromEpochMillisecondString(updatedDeal.details.manualInclusionNoticeSubmissionDate);
            const minPlus3Months = add(manualInclusionApplicationSubmissionDate, { months: 3 });
            const formattedManualInclusionNoticeSubmissionDate = format(manualInclusionApplicationSubmissionDate, DATE_FORMATS.LONG_FORM_DATE);
            const minPlus3MonthsFormatted = format(minPlus3Months, DATE_FORMATS.LONG_FORM_DATE);

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate.order).toBeDefined();

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

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': format(todayPlus3Months1Day, 'dd'),
              'requestedCoverStartDate-month': format(todayPlus3Months1Day, 'MM'),
              'requestedCoverStartDate-year': format(todayPlus3Months1Day, 'yyyy'),
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

const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');

describe('/v1/deals/:id/bond', () => {
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
        { id: 15, answer: true },
      ],
    },
  });

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    facilityStage: 'Unissued',
    hasBeenIssued: false,
    ukefGuaranteeInMonths: '24',
    name: '1234',
    bondBeneficiary: 'test',
    value: '123',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '1',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: '365',
  };

  let aBarclaysMaker;
  let deal;
  let dealId;
  let bondId;

  const updateBondInDeal = async (theDealId, bond) => {
    const response = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${theDealId}/bond/${bondId}`);
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

    const bondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    const { bondId: _id } = bondResponse.body;
    bondId = _id;

    deal.bondTransactions = bondResponse.body.bondTransactions;
  });

  describe('GET /v1/deals/:id/bond/:id', () => {
    it('returns a bond with validationErrors for all required fields', async () => {
      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(body.validationErrors.count).toEqual(8);
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/${bondId}`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(8);
    });

    describe('bondType', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            bondType: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.bondType).toBeDefined();
          expect(body.validationErrors.errorList.bondType.text).toEqual('Enter the Bond type');
        });
      });
    });

    describe('value', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            value: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.value).toBeDefined();
          expect(body.validationErrors.errorList.value.text).toEqual('Enter the Bond value');
        });
      });

      describe('when not a number', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            value: 'test',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.value).toBeDefined();
          expect(body.validationErrors.errorList.value.text).toEqual('Bond value must be a currency format, like 1,345 or 1345.54');
        });
      });

      describe('when less than 0.01', () => {
        it('should return validationError', async () => {
          const bond = {
            value: '0',
          };

          const { validationErrors } = await updateBondInDeal(dealId, bond);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Bond value must be 0.01 or more');
        });
      });

      describe('with more than 2 decimal points', () => {
        it('should return validationError', async () => {
          const bond = {
            value: '0.123',
          };

          const { validationErrors } = await updateBondInDeal(dealId, bond);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Bond value must have less than 3 decimals, like 12 or 12.10');
        });
      });

      describe('with more than 14 digits and no decimal points', () => {
        it('should return validationError', async () => {
          const bond = {
            value: '123456789112345',
          };

          const { validationErrors } = await updateBondInDeal(dealId, bond);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Bond value must be 14 numbers or fewer');
        });
      });

      describe('with more than 14 digits and decimal points', () => {
        it('should return validationError', async () => {
          const bond = {
            value: '123456789112345.12',
          };

          const { validationErrors } = await updateBondInDeal(dealId, bond);
          expect(validationErrors.errorList.value).toBeDefined();
          expect(validationErrors.errorList.value.text).toEqual('Bond value must be 14 numbers or fewer');
        });
      });
    });

    describe('facilityStage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            facilityStage: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.facilityStage).toBeDefined();
          expect(body.validationErrors.errorList.facilityStage.text).toEqual('Enter the Bond stage');
        });
      });
    });

    describe('when facilityStage is `Unissued`', () => {
      describe('ukefGuaranteeInMonths', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Unissued',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '',
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Enter the Length of time that the UKEF\'s guarantee will be in place for');
          });
        });

        describe('when not numeric', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Unissued',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: 'test',
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a number, like 1 or 12');
          });
        });

        describe('when contains decimal', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Unissued',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '6.3',
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be a whole number, like 12');
          });
        });

        describe('when less than 0', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Unissued',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '-1',
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });

        describe('when greater than 999', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Unissued',
              hasBeenIssued: false,
              ukefGuaranteeInMonths: '1000',
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.order).toBeDefined();
            expect(body.validationErrors.errorList.ukefGuaranteeInMonths.text).toEqual('Length of time that the UKEF\'s guarantee will be in place for must be between 0 and 999');
          });
        });
      });
    });

    describe('when facilityStage is `Issued`', () => {
      describe('requestedCoverStartDate', () => {
        const updateRequestedCoverStartDate = async (requestedCoverStartDate) => {
          const bond = {
            ...allBondFields,
            facilityStage: 'Issued',
            hasBeenIssued: true,
            ...requestedCoverStartDate,
          };

          const body = await updateBondInDeal(dealId, bond);
          return body;
        };

        describe('when is before today', () => {
          it('should return validationError', async () => {
            const beforeToday = moment().subtract(1, 'day');

            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(beforeToday).format('DD'),
              'requestedCoverStartDate-month': moment(beforeToday).format('MM'),
              'requestedCoverStartDate-year': moment(beforeToday).format('YYYY'),
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeDefined();
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual('Requested Cover Start Date must be today or in the future');
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

        describe('when eligibility criteria 15 answer is `false`', () => {
          it('should NOT return validationError when date is greater than 3 months', async () => {
            const dealWithEligibilityCriteria15False = {
              ...deal,
              eligibility: {
                criteria: [
                  { id: 15, answer: false },
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

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const requestedCoverStartDateFields = {
              'requestedCoverStartDate-day': moment(nowDate).format('DD'),
              'requestedCoverStartDate-month': '',
              'requestedCoverStartDate-year': '',
            };

            const { validationErrors } = await updateRequestedCoverStartDate(requestedCoverStartDateFields);
            expect(validationErrors.errorList.requestedCoverStartDate).toBeDefined();

            const expectedText = dateValidationText(
              'Requested Cover Start Date',
              requestedCoverStartDateFields['requestedCoverStartDate-day'],
              requestedCoverStartDateFields['requestedCoverStartDate-month'],
              requestedCoverStartDateFields['requestedCoverStartDate-year'],
            );
            expect(validationErrors.errorList.requestedCoverStartDate.text).toEqual(expectedText);
          });
        });
      });

      describe('coverEndDate', () => {
        const updateCoverEndDate = async (coverEndDate) => {
          const bond = {
            ...allBondFields,
            facilityStage: 'Issued',
            hasBeenIssued: true,
            ...coverEndDate,
          };

          const body = await updateBondInDeal(dealId, bond);
          return body;
        };

        describe('when missing', () => {
          it('should return validationError', async () => {
            const coverEndDateFields = {
              'coverEndDate-day': '',
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate).toBeDefined();
            expect(validationErrors.errorList.coverEndDate.text).toEqual('Enter the Cover End Date');
          });
        });

        describe('when has some values', () => {
          it('should return validationError', async () => {
            const nowDate = moment();
            const coverEndDateFields = {
              'coverEndDate-day': moment(nowDate).add(1, 'day').format('DD'),
              'coverEndDate-month': '',
              'coverEndDate-year': '',
            };

            const { validationErrors } = await updateCoverEndDate(coverEndDateFields);
            expect(validationErrors.errorList.coverEndDate).toBeDefined();
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
            expect(validationErrors.errorList.coverEndDate).toBeDefined();
            expect(validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date must be today or in the future');
          });
        });

        describe('when is before requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = moment(date).add(2, 'months');
            const coverEndDate = moment(date).add(2, 'months').subtract(1, 'day');

            const bond = {
              ...allBondFields,
              facilityStage: 'Issued',
              hasBeenIssued: true,
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              'coverEndDate-day': moment(coverEndDate).format('DD'),
              'coverEndDate-month': moment(coverEndDate).format('MM'),
              'coverEndDate-year': moment(coverEndDate).format('YYYY'),
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
            expect(body.validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date cannot be before Requested Cover Start Date');
          });
        });

        describe('when is same as requestedCoverStartDate', () => {
          it('should return validationError', async () => {
            const date = moment();
            const requestedCoverStartDate = date;
            const coverEndDate = date;

            const bond = {
              ...allBondFields,
              facilityStage: 'Issued',
              hasBeenIssued: true,
              'requestedCoverStartDate-day': moment(requestedCoverStartDate).format('DD'),
              'requestedCoverStartDate-month': moment(requestedCoverStartDate).format('MM'),
              'requestedCoverStartDate-year': moment(requestedCoverStartDate).format('YYYY'),
              'coverEndDate-day': moment(coverEndDate).format('DD'),
              'coverEndDate-month': moment(coverEndDate).format('MM'),
              'coverEndDate-year': moment(coverEndDate).format('YYYY'),
            };

            const body = await updateBondInDeal(dealId, bond);
            expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
            expect(body.validationErrors.errorList.coverEndDate.text).toEqual('Cover End Date must be after the Requested Cover Start Date');
          });
        });
      });

      describe('name', () => {
        describe('when missing', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Issued',
              hasBeenIssued: true,
              name: '',
            };

            const { validationErrors } = await updateBondInDeal(dealId, bond);
            expect(validationErrors.errorList.name).toBeDefined();
            expect(validationErrors.errorList.name.text).toEqual('Enter the Bond\'s unique identification number');
          });
        });

        describe('when more than 30 characters', () => {
          it('should return validationError', async () => {
            const bond = {
              ...allBondFields,
              facilityStage: 'Issued',
              hasBeenIssued: true,
              name: 'a'.repeat(31),
            };

            const { validationErrors } = await updateBondInDeal(dealId, bond);
            expect(validationErrors.errorList.name).toBeDefined();
            expect(validationErrors.errorList.name.text).toEqual('Bond\'s unique identification number must be 30 characters or fewer');
          });
        });
      });
    });

    describe('currencySameAsSupplyContractCurrency', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            currencySameAsSupplyContractCurrency: '',
          };

          const { validationErrors } = await updateBondInDeal(dealId, bond);
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency).toBeDefined();
          expect(validationErrors.errorList.currencySameAsSupplyContractCurrency.text).toEqual('Select if the currency for this Transaction is the same as your Supply Contract currency');
        });
      });
    });

    describe('when currencySameAsSupplyContractCurrency is false', () => {
      describe('conversionRate', () => {
        const updateBondConversionRate = async (conversionRate) => {
          const bond = {
            ...allBondFields,
            currencySameAsSupplyContractCurrency: 'false',
            conversionRate,
          };

          const body = await updateBondInDeal(dealId, bond);
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
          const bond = {
            ...allBondFields,
            currencySameAsSupplyContractCurrency: 'false',
            ...conversionRateDate,
          };

          const body = await updateBondInDeal(dealId, bond);
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

        describe('when more than 29 days in the past', () => {
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
            const bond = {
              ...allBondFields,
              currencySameAsSupplyContractCurrency: 'false',
              currency: '',
            };

            const { validationErrors } = await updateBondInDeal(dealId, bond);
            expect(validationErrors.errorList.currency).toBeDefined();
            expect(validationErrors.errorList.currency.text).toEqual('Enter the Currency');
          });
        });
      });
    });

    describe('riskMarginFee', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            riskMarginFee: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Enter the Risk Margin Fee %');
        });
      });

      describe('when not a number', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            riskMarginFee: '123test',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must be a number, like 1 or 12.65');
        });
      });

      describe('when not between 0 and 99', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            riskMarginFee: '100',
          };

          let body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must be between 0 and 99');

          bond.riskMarginFee = '-1';

          body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must be between 0 and 99');
        });
      });

      describe('when more than 4 decimals', () => {
        it('should return validationError when more than 4 decimals', async () => {
          const bond = {
            ...allBondFields,
            riskMarginFee: '60.12345',
          };

          const body = await updateBondInDeal(dealId, bond);
          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must have less than 5 decimals, like 12 or 12.0010');
        });
      });
    });

    describe('coveredPercentage', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            coveredPercentage: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Enter the Covered Percentage');
        });
      });

      describe('when not between 1 and 99', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            coveredPercentage: '123test',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be a number, like 1 or 80');
        });
      });

      describe('when less than 1', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            coveredPercentage: '0.09',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when greater than 80', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            coveredPercentage: '81',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
        });
      });

      describe('when has more 4 decimals', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            coveredPercentage: '12.34567',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
          expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must have less than 5 decimals, like 12 or 12.3456');
        });
      });
    });

    describe('minimumRiskMarginFee', () => {
      describe('when not a number', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            minimumRiskMarginFee: 'test',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be a number, like 1 or 12.65');
        });
      });

      describe('when less than 0', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            minimumRiskMarginFee: '-1',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be 0 or more');
        });
      });

      describe('when more than 14 digits', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            minimumRiskMarginFee: '123456789012345',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be 14 numbers or fewer');
        });
      });

      describe('when more than 2 decimals', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            minimumRiskMarginFee: '8.123',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
          expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must have less than 3 decimals, like 1 or 12.10');
        });
      });
    });

    describe('feeType', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            feeType: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.feeType).toBeDefined();
          expect(body.validationErrors.errorList.feeType.text).toEqual('Enter the Fee type');
        });
      });

      describe('when feeType is `In advance`', () => {
        it('should return validationError for feeFrequency', async () => {
          const bond = {
            ...allBondFields,
            feeType: 'In advance',
            feeFrequency: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.feeFrequency).toBeDefined();
          expect(body.validationErrors.errorList.feeFrequency.text).toEqual('Enter the Fee frequency');
        });
      });

      describe('when feeType as `In arrear`', () => {
        it('should return validationError for feeFrequency', async () => {
          const bond = {
            ...allBondFields,
            feeType: 'In arrear',
            feeFrequency: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.feeFrequency).toBeDefined();
          expect(body.validationErrors.errorList.feeFrequency.text).toEqual('Enter the Fee frequency');
        });
      });
    });

    describe('dayCountBasis', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const bond = {
            ...allBondFields,
            dayCountBasis: '',
          };

          const body = await updateBondInDeal(dealId, bond);

          expect(body.validationErrors.errorList.dayCountBasis).toBeDefined();
          expect(body.validationErrors.errorList.dayCountBasis.text).toEqual('Enter the Day count basis');
        });
      });
    });
  });
});

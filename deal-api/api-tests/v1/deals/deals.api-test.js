const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const dealWithAboutComplete = require('../../fixtures/deal-with-complete-about-section.json');
const dealWithAboutIncomplete = require('../../fixtures/deal-with-incomplete-about-section.json');
const completedDeal = require('../../fixtures/deal-full-completed');
const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
  },
  comments: [{
    username: 'bananaman',
    timestamp: '1984/12/25 00:00:00:001',
    text: 'Merry Christmas from the 80s',
  }, {
    username: 'supergran',
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Also Merry Christmas from the 80s',
  }],
});

describe('/v1/deals', () => {
  let noRoles;
  let anHSBCMaker;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('GET /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(newDeal));
    });

    it('calculates deal.submissionDetails.status = Incomplete if there are validation failures', async () => {
      const postResult = await as(anHSBCMaker).post(dealWithAboutIncomplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(body.deal.submissionDetails.status).toEqual('Incomplete');
    });

    it('calculates deal.submissionDetails.status = Completed if there are no validation failures', async () => {
      const postResult = await as(anHSBCMaker).post(dealWithAboutComplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(body.deal.submissionDetails.status).toEqual('Completed');
    });
  });

  describe('POST /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newDeal).to('/v1/deals');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).post(newDeal).to('/v1/deals');

      expect(status).toEqual(401);
    });

    it('returns the created deal', async () => {
      const { body, status } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(newDeal));
    });

    it('creates incremental integer deal IDs', async () => {
      const deal1 = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const deal2 = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const deal3 = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      expect(parseInt(deal1.body._id).toString()).toEqual(deal1.body._id);
      expect(deal2.body._id - deal1.body._id).toEqual(1);
      expect(deal3.body._id - deal2.body._id).toEqual(1);
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          details: {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
          },
        };

        const { body, status } = await as(anHSBCMaker).post(postBody).to('/v1/deals');

        expect(status).toEqual(400);
        expect(body.details.bankSupplyContractID).toEqual(postBody.details.bankSupplyContractID);
        expect(body.details.bankSupplyContractName).toEqual(postBody.details.bankSupplyContractName);
        expect(body.validationErrors.count).toEqual(2);
        expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
        expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
      });
    });
  });

  describe('PUT /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const updatedDeal = {
        ...body,
        bankSupplyContractName: 'change this field',
      };

      const { status } = await as(aBarclaysMaker).put(updatedDeal).to(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(newDeal).to('/v1/deals/123456789012');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status, body } = await as(aSuperuser).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
    });

    it('returns the updated deal', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status, body } = await as(anHSBCMaker).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(updatedDeal));
    });

    it('handles partial updates', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const partialUpdate = {
        details: {
          bankSupplyContractName: 'change this field',
        },
      };

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };

      const { status, body } = await as(anHSBCMaker).put(partialUpdate).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body).toEqual(expectAddedFields(expectedDataIncludingUpdate));
    });

    it('updates the deal', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          bankSupplyContractName: 'change this field',
        },
      };
      await as(anHSBCMaker).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal).toEqual(expectAddedFields(updatedDeal));
    });
  });

  describe('DELETE /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const { status } = await as(noRoles).remove('/v1/deals/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests from users if <user>.bank != <resource>.details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${body._id}`);

      expect(status).toEqual(401);
    });

    it('404s requests to delete unkonwn ids', async () => {
      const { status } = await as(anHSBCMaker).remove('/v1/deals/123456789012');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).remove(`/v1/deals/${body._id}`);

      expect(status).toEqual(200);
    });

    it('deletes the deal', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      await as(anHSBCMaker).remove(`/v1/deals/${body._id}`);

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(404);
    });
  });

  describe('POST /v1/deals/:id/clone', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(404);
    });

    describe('with post body', () => {
      let originalDeal;

      beforeEach(async () => {
        const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
        originalDeal = body;
      });

      it('clones a deal with modified _id, bankSupplyContractID, bankSupplyContractName and new dates', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        expect(body._id).toEqual(body._id);
        expect(body.details).toEqual({
          ...originalDeal.details,
          bankSupplyContractID: clonePostBody.bankSupplyContractID,
          bankSupplyContractName: clonePostBody.bankSupplyContractName,
          submissionDate: body.details.submissionDate, // TODO: should this now be 'NOT submitted'
          dateOfLastAction: body.details.dateOfLastAction,
        });
      });

      it('clones a deal with only specific bondTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const firstOriginalBond = originalDeal.bondTransactions.items[0];
        const lastOriginalBond = originalDeal.bondTransactions.items[1];

        const expectedBondTransactions = {
          items: [
            {
              _id: firstOriginalBond._id,
              bondStage: firstOriginalBond.bondStage,
              'requestedCoverStartDate-day': firstOriginalBond['requestedCoverStartDate-day'],
              'requestedCoverStartDate-month': firstOriginalBond['requestedCoverStartDate-month'],
              'requestedCoverStartDate-year': firstOriginalBond['requestedCoverStartDate-year'],
              'coverEndDate-day': firstOriginalBond['coverEndDate-day'],
              'coverEndDate-month': firstOriginalBond['coverEndDate-month'],
              'coverEndDate-year': firstOriginalBond['coverEndDate-year'],
              facilityValue: firstOriginalBond.facilityValue,
              currencySameAsSupplyContractCurrency: firstOriginalBond.currencySameAsSupplyContractCurrency,
              currency: firstOriginalBond.currency,
              conversionRate: firstOriginalBond.conversionRate,
              'conversionRateDate-day': firstOriginalBond['conversionRateDate-day'],
              'conversionRateDate-month': firstOriginalBond['conversionRateDate-month'],
              'conversionRateDate-year': firstOriginalBond['conversionRateDate-year'],
              uniqueIdentificationNumber: firstOriginalBond.uniqueIdentificationNumber,
              ukefGuaranteeInMonths: firstOriginalBond.ukefGuaranteeInMonths,
            },
            {
              _id: lastOriginalBond._id,
              bondStage: lastOriginalBond.bondStage,
              'requestedCoverStartDate-day': lastOriginalBond['requestedCoverStartDate-day'],
              'requestedCoverStartDate-month': lastOriginalBond['requestedCoverStartDate-month'],
              'requestedCoverStartDate-year': lastOriginalBond['requestedCoverStartDate-year'],
              'coverEndDate-day': lastOriginalBond['coverEndDate-day'],
              'coverEndDate-month': lastOriginalBond['coverEndDate-month'],
              'coverEndDate-year': lastOriginalBond['coverEndDate-year'],
              facilityValue: lastOriginalBond.facilityValue,
              currencySameAsSupplyContractCurrency: lastOriginalBond.currencySameAsSupplyContractCurrency,
              currency: lastOriginalBond.currency,
              uniqueIdentificationNumber: lastOriginalBond.uniqueIdentificationNumber,
              ukefGuaranteeInMonths: lastOriginalBond.ukefGuaranteeInMonths,
            },
          ],
        };

        expect(body.bondTransactions).toEqual(expectedBondTransactions);
      });

      it('clones a deal with only specific loanTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const firstOriginalLoan = originalDeal.loanTransactions.items[0];
        const lastOriginalLoan = originalDeal.loanTransactions.items[1];

        const expectedLoanTransactions = {
          items: [
            {
              _id: firstOriginalLoan._id,
              bankReferenceNumber: firstOriginalLoan.bankReferenceNumber,
              facilityValue: firstOriginalLoan.facilityValue,
              currencySameAsSupplyContractCurrency: firstOriginalLoan.currencySameAsSupplyContractCurrency,
              currency: firstOriginalLoan.currency,
              ukefGuaranteeInMonths: firstOriginalLoan.ukefGuaranteeInMonths,
            },
            {
              _id: lastOriginalLoan._id,
              bankReferenceNumber: lastOriginalLoan.bankReferenceNumber,
              'requestedCoverStartDate-day': lastOriginalLoan['requestedCoverStartDate-day'],
              'requestedCoverStartDate-month': lastOriginalLoan['requestedCoverStartDate-month'],
              'requestedCoverStartDate-year': lastOriginalLoan['requestedCoverStartDate-year'],
              'coverEndDate-day': lastOriginalLoan['coverEndDate-day'],
              'coverEndDate-month': lastOriginalLoan['coverEndDate-month'],
              'coverEndDate-year': lastOriginalLoan['coverEndDate-year'],
              facilityValue: lastOriginalLoan.facilityValue,
              currencySameAsSupplyContractCurrency: lastOriginalLoan.currencySameAsSupplyContractCurrency,
              currency: lastOriginalLoan.currency,
              conversionRate: lastOriginalLoan.conversionRate,
              'conversionRateDate-day': lastOriginalLoan['conversionRateDate-day'],
              'conversionRateDate-month': lastOriginalLoan['conversionRateDate-month'],
              'conversionRateDate-year': lastOriginalLoan['conversionRateDate-year'],
              disbursementAmount: lastOriginalLoan.disbursementAmount,
            },
          ],
        };

        expect(body.loanTransactions).toEqual(expectedLoanTransactions);
      });

      describe('when req.body has cloneTransactions set to false', () => {
        it('clones a deal with empty transactions', async () => {
          const clonePostBody = {
            bankSupplyContractID: 'new-bank-deal-id',
            bankSupplyContractName: 'new-bank-deal-name',
            cloneTransactions: 'false',
          };
          const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

          expect(body.bondTransactions).toEqual({
            items: [],
          });
          expect(body.loanTransactions).toEqual({
            items: [],
          });
        });
      });

      describe('when required fields are missing', () => {
        it('returns validation errors', async () => {
          const clonePostBody = {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
            cloneTransactions: '',
          };
          const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

          expect(body.validationErrors.count).toEqual(3);
          expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
          expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
          expect(body.validationErrors.errorList.cloneTransactions).toBeDefined();
        });
      });
    });
  });
});

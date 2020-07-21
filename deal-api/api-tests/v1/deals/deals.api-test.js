const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const dealWithAboutComplete = require('../../fixtures/deal-with-complete-about-section.json');
const dealWithAboutIncomplete = require('../../fixtures/deal-with-incomplete-about-section.json');
const { as } = require('../../api')(app);
const { expectAddedFields, expectAddedFieldsWithEditedByObject } = require('./expectAddedFields');
const calculateDealSummary = require('../../../src/v1/deal-summary');

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

    it('returns a deal with calculated summary/totals object', async () => {
      const postResult = await as(anHSBCMaker).post(dealWithAboutComplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(body.deal.summary).toEqual(calculateDealSummary(body.deal));
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

      expect(body).toEqual(expectAddedFieldsWithEditedByObject(updatedDeal, anHSBCMaker));
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
      expect(body.deal).toEqual(expectAddedFieldsWithEditedByObject(updatedDeal, anHSBCMaker));
    });

    // TODO
    // it('adds updates `editedBy` array', () => {
      
    // });
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
});

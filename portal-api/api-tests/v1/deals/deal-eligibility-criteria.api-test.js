const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const {
  updatedECPartial,
  updatedECCompleted,
  updatedECCompletedAllTrue,
  updatedECCriteria11NoExtraInfo,
  updatedECCriteria11WithExtraInfo,
  criteria11ExtraInfo,
  criteria11ExtraInfoEmpty,
} = require('./mocks');

const newDeal = aDeal({ additionalRefName: 'Original Value' });

describe('/v1/deals/:id/eligibility-criteria', () => {
  let noRoles;
  let anHSBCMaker;
  let aBarclaysMaker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('PUT /v1/deals/:id/eligibility-criteria', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updatedECPartial).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(updatedECPartial).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status } = await as(anHSBCMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).put(updatedECPartial).to('/v1/deals/123456789012/eligibility-criteria');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status } = await as(aSuperuser).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
    });

    it('updates the eligibility criteria with lastUpdated timestamp on each update', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      // first update
      await as(aBarclaysMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      expect(typeof body.deal.eligibility.lastUpdated).toEqual('number');

      const lastUpdatedOriginalValue = body.deal.eligibility.lastUpdated;

      // second update
      await as(aBarclaysMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      const { body: secondUpdateBody } = await as(aBarclaysMaker).get(`/v1/deals/${newId}`);

      expect(typeof secondUpdateBody.deal.eligibility.lastUpdated).toEqual('number');

      expect(secondUpdateBody.deal.eligibility.lastUpdated).not.toEqual(lastUpdatedOriginalValue);
    });

    it('updates all the eligibility criteria without validation error', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(0);
    });

    it('updates some of the eligibility criteria and generates validation errors', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(5);

      const errorIdList = [];
      Object.entries(body.eligibility.validationErrors.errorList).forEach(([key, value]) => {
        if (value.text) {
          errorIdList.push(key);
        }
      });
      expect(errorIdList).toEqual(['13', '15', '16', '17', '18']);
    });

    it('generated validation errors if criteria11 is false but extra info not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const updatedECPostcode = {
        ...updatedECCriteria11NoExtraInfo,
        agentAddressCountry: 'GBR',
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECPostcode).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(8);

      const errorIdList = [];
      Object.entries(body.eligibility.validationErrors.errorList).forEach(([key, value]) => {
        if (value.text) {
          errorIdList.push(key);
        }
      });

      expect(errorIdList).toEqual(['13', '15', '16', '17', '18', 'agentAddressLine1', 'agentAddressPostcode', 'agentName']);
    });

    it('generated postcode validation error if criteria11 is false and country = GBR but postcode not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11NoExtraInfo).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.count).toEqual(8);

      const errorIdList = [];
      Object.entries(body.eligibility.validationErrors.errorList).forEach(([key, value]) => {
        if (value.text) {
          errorIdList.push(key);
        }
      });

      expect(errorIdList).toEqual(['13', '15', '16', '17', '18', 'agentAddressCountry', 'agentAddressLine1', 'agentName']);
    });

    it('updates criteria 11 extra info in criteria11 is false', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfo).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility).toMatchObject(criteria11ExtraInfo);
    });

    it('limits length of agent name to 150 characters', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;
      const characterCount = 150;

      const updatedECCriteria11WithExtraInfoLongAgent = {
        ...updatedECCriteria11WithExtraInfo,
        agentName: 'a'.repeat(characterCount + 1),
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoLongAgent).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.agentName).toEqual(updatedECCriteria11WithExtraInfoLongAgent.agentName.substring(0, characterCount));
    });

    it('does not generate town mandatory error if criteria11 is false and country = GBR and town not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const updatedECCriteria11WithExtraInfoNotGBR = {
        ...updatedECCriteria11WithExtraInfo,
        agentAddressTown: '',
        agentAddressCountry: 'GBR',
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoNotGBR).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.errorList.agentAddressTown.text).toBeUndefined();
    });

    it('generates town mandatory error if criteria11 is false and country != GBR and town not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const updatedECCriteria11WithExtraInfoNotGBR = {
        ...updatedECCriteria11WithExtraInfo,
        agentAddressTown: '',
        agentAddressCountry: 'AUS',
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoNotGBR).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.errorList.agentAddressTown.text).toEqual("Agent's city/town is required");
    });

    it('removes criteria 11 extra info when criteria11 is changed from false to true', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfo).to(`/v1/deals/${newId}/eligibility-criteria`);
      expect(body.eligibility).toMatchObject(criteria11ExtraInfo);

      const updateCriteria11Eligibility = {
        ...body.eligibility,
        'criterion-11': 'true',
      };

      const { status, body: body2 } = await as(aBarclaysMaker).put(updateCriteria11Eligibility).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body2.eligibility).toMatchObject(criteria11ExtraInfoEmpty);
    });

    it('does not update submissionType if not all answered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.submissionType).toEqual('');
    });

    it('updates the submissionType to AIN if all true answers', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCompletedAllTrue).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.submissionType).toEqual('Automatic Inclusion Notice');
    });

    it('updates the submissionType to MIA if all true answers', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.submissionType).toEqual('Manual Inclusion Application');
    });

    it('updates the lastUpdated timestamp on each update', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { body: firstUpdate } = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${dealId}/eligibility-criteria`);

      const firstUpdateTimeStamp = firstUpdate.eligibility.lastUpdated;

      const { body: secondUpdate } = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${dealId}/eligibility-criteria`);

      expect(typeof secondUpdate.eligibility.lastUpdated).toEqual('number');
      expect(typeof secondUpdate.eligibility.lastUpdated).not.toEqual(firstUpdateTimeStamp);
    });
  });
});

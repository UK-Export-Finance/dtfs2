const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectAddedFields } = require('../deals/expectAddedFields');

const {
  updatedECPartial,
  updatedECCompleted,
  updatedECCompletedAllTrue,
  updatedECCriteria11NoExtraInfo,
  updatedECCriteria11WithExtraInfo,
  criteria11ExtraInfo,
  criteria11ExtraInfoEmpty,
} = require('./mocks');

const newDeal = aDeal({ bankSupplyContractName: 'Original Value' });

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

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
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

    it('updates the eligibility criteria', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      await as(aBarclaysMaker).put(updatedECPartial).to(`/v1/deals/${newId}/eligibility-criteria`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(200);
      //
      //
      // Expected: {"criterion-11": "true", "criterion-12": "true", "criterion-13": "true", "criterion-14": "true", "criterion-15": "false", "criterion-16": "true", "criterion-17": "true", "criterion-18": "true"}
      // Received: [{"answer": true, "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve agents and the Bank is not aware that any of the information contained within it is inaccurate.", "id": 11}, {"answer": true, "description": "The cover period for each Transaction does not exceed 5 years, or such other period approved by UKEF (that has not lapsed or been withdrawn) in relation to bonds and/or loans for this Obligor.", "id": 12}, {"answer": true, "description": "The total UKEF exposure, across all short-term schemes (including bond support and export working capital transactions), for this Obligor (including this Transaction) does not exceed £2 million, or such other limit approved by UKEF (that has not lapsed or been withdrawn).", "id": 13}, {"answer": true, "description": "For a bond Transaction, the bond has not yet been issued or, where the bond has been issued, this was done no more than 3 months prior to the submission of this Inclusion Notice. For a loan Transaction, the loan has not yet been advanced.", "id": 14}, {"answer": false, "description": "The Requested Cover Start Date is no more than three months from the date of submission.", "id": 15}, {"answer": true, "description": "The Supplier has confirmed in its Supplier Declaration that the Supply Contract does not involve any of the following Controlled Sectors: sharp arms defence, nuclear, radiological, biological, human cloning, pornography, tobacco or gambling, and the Bank is not aware that any of the information contained within it is inaccurate.", "id": 16}, {"answer": true, "description": "The Bank has completed its Bank Due Diligence to its satisfaction in accordance with its policies and procedures without having to escalate to any Relevant Person.", "id": 17}, {"answer": true, "description": "The fees and/or interest apply to the whole Cover Period, and have been set in accordance with the Bank’s normal pricing policies and, if any, minimum or overall pricing requirements set by UKEF.", "id": 18}]
      //
      // expect(body.eligibility.criteria).toEqual(updatedEC);
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
        'agent-country': 'GBR',
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

      expect(errorIdList).toEqual(['13', '15', '16', '17', '18', 'agent-address-line-1', 'agent-name', 'agent-postcode']);
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

      expect(errorIdList).toEqual(['13', '15', '16', '17', '18', 'agent-address-line-1', 'agent-country', 'agent-name']);
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
        'agent-name': 'a'.repeat(characterCount + 1),
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoLongAgent).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.agentName).toEqual(updatedECCriteria11WithExtraInfoLongAgent['agent-name'].substring(0, characterCount));
    });

    it('does not generate town mandatory error if criteria11 is false and country = GBR and town not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const updatedECCriteria11WithExtraInfoNotGBR = {
        ...updatedECCriteria11WithExtraInfo,
        'agent-address-town': '',
        'agent-country': 'GBR',
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoNotGBR).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.errorList['agent-town'].text).toBeUndefined();
    });

    it('generates town mandatory error if criteria11 is false and country != GBR and town not entered', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const updatedECCriteria11WithExtraInfoNotGBR = {
        ...updatedECCriteria11WithExtraInfo,
        'agent-address-town': '',
        'agent-country': 'AUS',
      };

      const { status, body } = await as(aBarclaysMaker).put(updatedECCriteria11WithExtraInfoNotGBR).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.eligibility.validationErrors.errorList['agent-town'].text).toEqual("Agent's city/town is required");
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
      expect(body.details.submissionType).toEqual('');
    });

    it('updates the submissionType to AIN if all true answers', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCompletedAllTrue).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.details.submissionType).toEqual('Automatic Inclusion Notice');
    });

    it('updates the submissionType to MIA if all true answers', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${newId}/eligibility-criteria`);

      expect(status).toEqual(200);
      expect(body.details.submissionType).toEqual('Manual Inclusion Application');
    });
  });
});

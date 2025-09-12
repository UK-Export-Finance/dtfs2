const { isProduction } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../server/v1/roles/roles');
const { expectAddedFields, expectAddedFieldsWithEditedBy } = require('./expectAddedFields');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const databaseHelper = require('../../database-helper');
const aDeal = require('./deal-builder');
const testUserCache = require('../../api-test-users');
const dealWithAboutComplete = require('../../fixtures/deal-with-complete-about-section.json');
const dealWithAboutIncomplete = require('../../fixtures/deal-with-incomplete-about-section.json');
const calculateDealSummary = require('../../../server/v1/deal-summary');
const app = require('../../../server/createApp');
const { as, get } = require('../../api')(app);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isProduction: jest.fn(),
}));

const newDeal = aDeal({
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  comments: [
    {
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    },
    {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    },
  ],
  editedBy: [],
  supportingInformation: {
    securityDetails: {
      exporter: null,
    },
  },
});

describe('/v1/deals', () => {
  let testbank2Maker;
  let testbank1Maker;
  let testAdmin;
  let aSuperuser;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testbank1Maker = testUsers().withRole(MAKER).withBankName('Bank 1').one();
    testbank2Maker = testUsers().withRole(MAKER).withBankName('Bank 2').one();
    testAdmin = testUsers().withRole(ADMIN).one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/deals', () => {
    const dealsUrl = '/v1/deals';

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(dealsUrl),
      makeRequestWithAuthHeader: (authHeader) => get(dealsUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(dealsUrl),
      successStatusCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /v1/deals/:id', () => {
    let aDealUrl;

    beforeEach(async () => {
      const {
        body: { _id: dealId },
      } = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      aDealUrl = `/v1/deals/${dealId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aDealUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aDealUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withBankName('Bank 1').withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(aDealUrl),
      successStatusCode: HttpStatusCode.Ok,
    });

    it('400s requests that do not have a valid deal id', async () => {
      const { status } = await as(testbank2Maker).get('/v1/deals/12345');

      expect(status).toEqual(HttpStatusCode.BadRequest);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(testbank1Maker).get('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.NotFound);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(testbank2Maker).get(aDealUrl);

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).get(aDealUrl);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('returns the requested resource', async () => {
      const { status, body } = await as(testbank1Maker).get(aDealUrl);
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal).toEqual(expectAddedFields({ baseDeal: newDeal, auditDetails: generatePortalAuditDetails(testbank1Maker._id) }));
    });

    it('calculates deal.submissionDetails.status = Incomplete if there are validation failures', async () => {
      const postResult = await as(testbank2Maker).post(dealWithAboutIncomplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal.submissionDetails.status).toEqual('Incomplete');
    });

    it('calculates deal.submissionDetails.status = Completed if there are no validation failures', async () => {
      const postResult = await as(testbank2Maker).post(dealWithAboutComplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal.submissionDetails.status).toEqual('Completed');
    });

    it('returns a deal with calculated summary/totals object', async () => {
      const postResult = await as(testbank2Maker).post(dealWithAboutComplete).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${newId}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal.summary).toEqual(calculateDealSummary(body.deal));
    });
  });

  describe('PUT /v1/deals/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(newDeal).to('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put(newDeal).to('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const updatedDeal = {
        ...body,
        additionalRefName: 'change this field',
      };

      const { status } = await as(testbank1Maker).put(updatedDeal).to(`/v1/deals/${body._id}`);

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          additionalRefName: 'change this field',
        },
      };

      const { status } = await as(aSuperuser).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('returns the updated deal', async () => {
      const { body: dealPost } = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const { body: dealAfterCreation } = await as(testbank2Maker).get(`/v1/deals/${dealPost._id}`);

      const createdDeal = dealAfterCreation.deal;
      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          additionalRefName: 'change this field',
        },
      };

      const { status, body } = await as(testbank2Maker).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(HttpStatusCode.Ok);

      expect(body).toMatchObject(
        expectAddedFieldsWithEditedBy({ baseDeal: updatedDeal, user: testbank2Maker, auditDetails: generatePortalAuditDetails(testbank2Maker._id) }),
      );
    });

    it('handles partial updates', async () => {
      const { body: dealPost } = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const { body: dealAfterCreation } = await as(testbank2Maker).get(`/v1/deals/${dealPost._id}`);

      const createdDeal = dealAfterCreation.deal;

      const partialUpdate = {
        details: {
          additionalRefName: 'change this field',
        },
      };

      const expectedDataIncludingUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          additionalRefName: 'change this field',
        },
      };

      const { status: putStatus } = await as(testbank2Maker).put(partialUpdate).to(`/v1/deals/${createdDeal._id}`);
      expect(putStatus).toEqual(HttpStatusCode.Ok);

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal).toMatchObject(
        expectAddedFieldsWithEditedBy({
          baseDeal: expectedDataIncludingUpdate,
          user: testbank2Maker,
          auditDetails: generatePortalAuditDetails(testbank2Maker._id),
        }),
      );
    });

    it('updates the deal', async () => {
      const { body: dealPost } = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const { body: dealAfterCreation } = await as(testbank2Maker).get(`/v1/deals/${dealPost._id}`);

      const createdDeal = dealAfterCreation.deal;

      const updatedDeal = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          additionalRefName: 'change this field',
        },
      };
      await as(testbank2Maker).put(updatedDeal).to(`/v1/deals/${createdDeal._id}`);

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.deal).toMatchObject(
        expectAddedFieldsWithEditedBy({ baseDeal: updatedDeal, user: testbank2Maker, auditDetails: generatePortalAuditDetails(testbank2Maker._id) }),
      );
    });

    it('adds updates and retains `editedBy` array with req.user data', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const firstUpdate = {
        ...createdDeal,
        details: {
          ...createdDeal.details,
          additionalRefName: 'change this field',
        },
      };

      await as(testbank2Maker).put(firstUpdate).to(`/v1/deals/${createdDeal._id}`);

      const dealAfterFirstUpdate = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      const secondUpdate = {
        ...dealAfterFirstUpdate.body.deal,
        details: {
          ...dealAfterFirstUpdate.body.deal.details,
          additionalRefName: 'change this field again',
        },
      };

      await as(testbank2Maker).put(secondUpdate).to(`/v1/deals/${createdDeal._id}`);

      const dealAfterSecondUpdate = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);
      expect(dealAfterSecondUpdate.status).toEqual(HttpStatusCode.Ok);
      expect(dealAfterSecondUpdate.body.deal.editedBy.length).toEqual(2);
      expect(dealAfterSecondUpdate.body.deal.editedBy[0]).toEqual(
        expectAddedFieldsWithEditedBy({
          baseDeal: secondUpdate,
          user: testbank2Maker,
          numberOfUpdates: 1,
          auditDetails: generatePortalAuditDetails(testbank2Maker._id),
        }).editedBy[0],
      );
      expect(dealAfterSecondUpdate.body.deal.editedBy[1]).toEqual(
        expectAddedFieldsWithEditedBy({
          baseDeal: secondUpdate,
          user: testbank2Maker,
          numberOfUpdates: 2,
          auditDetails: generatePortalAuditDetails(testbank2Maker._id),
        }).editedBy[1],
      );
    });
  });

  describe('POST /v1/deals', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newDeal).to('/v1/deals');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).post(newDeal).to('/v1/deals');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('returns the created deal', async () => {
      const { body: createdDeal, status } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const expectedCreateDeal = expectAddedFields({ baseDeal: newDeal, auditDetails: generatePortalAuditDetails(testbank2Maker._id) });

      expect(status).toEqual(HttpStatusCode.Ok);

      const { body: dealAfterCreation } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(dealAfterCreation.deal).toEqual(expectedCreateDeal);
    });

    it('creates unique deal IDs', async () => {
      const deal1 = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const deal2 = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const deal3 = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      expect(deal1.body._id).toEqual(deal1.body._id);
      expect(deal1.body._id).not.toEqual(deal2.body._id);
      expect(deal1.body._id).not.toEqual(deal3.body._id);
    });

    describe('when required fields are missing', () => {
      it('returns 400 with validation errors', async () => {
        const postBody = {
          bankInternalRefName: '',
          additionalRefName: '',
        };

        const { body: dealPost, status } = await as(testbank2Maker).post(postBody).to('/v1/deals');

        expect(status).toEqual(HttpStatusCode.BadRequest);

        expect(dealPost.validationErrors.count).toEqual(2);
        expect(dealPost.validationErrors.errorList.bankInternalRefName).toBeDefined();
        expect(dealPost.validationErrors.errorList.additionalRefName).toBeDefined();
      });
    });
  });

  describe('DELETE /v1/deals/:id', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should return 401 request that do not present a valid Authorization token', async () => {
      const { status } = await as().remove().to('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should return 401 request that do not come from a user with role=admin', async () => {
      await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const { status } = await as(testbank1Maker).remove().to('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should return 401 request from users if <user>.bank != <resource>.bank', async () => {
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const { status } = await as(testbank1Maker).remove().to(`/v1/deals/${body._id}`);

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should return 401 request if isProduction return true', async () => {
      isProduction.mockReturnValue(true);
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const { status } = await as(testAdmin).remove().to(`/v1/deals/${body._id}`);

      expect(status).toEqual(HttpStatusCode.Unauthorized);
    });

    it('should return 404 request to delete unknown ids', async () => {
      isProduction.mockReturnValue(false);
      const { status } = await as(testAdmin).remove().to('/v1/deals/620a1aa095a618b12da38c7b');

      expect(status).toEqual(HttpStatusCode.NotFound);
    });

    it('should accept request if <user>.role == ADMIN', async () => {
      isProduction.mockReturnValue(false);
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const { status } = await as(testAdmin).remove().to(`/v1/deals/${body._id}`);

      expect(status).toEqual(HttpStatusCode.Ok);
    });

    it('should delete the deal', async () => {
      isProduction.mockReturnValue(false);
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      await as(testAdmin).remove().to(`/v1/deals/${body._id}`);

      const { status } = await as(testbank2Maker).get(`/v1/deals/${body._id}`);

      expect(status).toEqual(HttpStatusCode.NotFound);
    });
  });
});

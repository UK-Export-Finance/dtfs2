const { HttpStatusCode } = require('axios');
const { ObjectId } = require('mongodb');
const app = require('../../../server/createApp');
const testUserCache = require('../../api-test-users');
const databaseHelper = require('../../database-helper');

const aDeal = require('../deals/deal-builder');

const { as, get } = require('../../api')(app);
const { ADMIN, MAKER } = require('../../../server/v1/roles/roles');

const { DB_COLLECTIONS } = require('../../fixtures/constants');

const aBank = require('./bank-builder');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const updatedBank = aBank({});

const newDeal = aDeal({
  updatedAt: Date.now(),
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  status: 'Draft',
  bank: updatedBank,
});

const BASE_URL = '/v1/validate/bank';

describe(BASE_URL, () => {
  let anAdmin;
  let testUsers;
  let testbank1Maker;
  let dealId;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    anAdmin = testUsers().withRole(ADMIN).one();

    const testbank1Makers = testUsers().withRole(MAKER).withBankName('Bank 1').all();
    [testbank1Maker] = testbank1Makers;
  });

  beforeEach(async () => {
    await databaseHelper.deleteBanks([updatedBank.id]);
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await as(anAdmin).postEach([updatedBank]).to('/v1/banks');
    await as(anAdmin).put(updatedBank).to(`/v1/banks/${updatedBank.id}`);

    const { body } = await as(testbank1Maker).post(newDeal).to('/v1/deals');

    dealId = body._id;
    await as(testUsers).put({ bank: updatedBank }).to(`/v1/deals/${dealId}`);
  });

  describe('GET /v1/banks', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(`${BASE_URL}`),
      makeRequestWithAuthHeader: (authHeader) => get(`${BASE_URL}`, { headers: { Authorization: authHeader } }),
    });

    it(`should return ${HttpStatusCode.Ok} when a valid bank and deal id is provided`, async () => {
      const queryBody = { dealId, bankId: updatedBank.id };
      const { status, body } = await as(anAdmin).getWithBody(queryBody).to(BASE_URL);

      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body.isValid).toEqual(true);
    });

    it(`should return ${HttpStatusCode.NotFound} when a bank id that is not associated with the deal is provided`, async () => {
      const queryBody = { dealId, bankId: 'some-other-bank-id' };
      const { status, body } = await as(anAdmin).getWithBody(queryBody).to(BASE_URL);

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body.isValid).toEqual(false);
    });

    it(`should return ${HttpStatusCode.NotFound} when the deal cannot be found`, async () => {
      const queryBody = { dealId: new ObjectId(), bankId: updatedBank.id };
      const { status, body } = await as(anAdmin).getWithBody(queryBody).to(BASE_URL);

      expect(status).toEqual(HttpStatusCode.NotFound);
      expect(body.isValid).toEqual(false);
    });

    it(`should return ${HttpStatusCode.BadRequest} when an invalid deal id is provided`, async () => {
      const queryBody = { dealId: 'not-an-object-id', bankId: updatedBank.id };
      const { status, body } = await as(anAdmin).getWithBody(queryBody).to(BASE_URL);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.isValid).toEqual(false);
    });

    it(`should return ${HttpStatusCode.BadRequest} when an invalid bank id is provided`, async () => {
      const queryBody = { dealId, bankId: 12345 };
      const { status, body } = await as(anAdmin).getWithBody(queryBody).to(BASE_URL);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.isValid).toEqual(false);
    });

    it(`should return ${HttpStatusCode.BadRequest} when no ids are provided`, async () => {
      const { status, body } = await as(anAdmin).get(BASE_URL);

      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body.isValid).toEqual(false);
    });
  });
});

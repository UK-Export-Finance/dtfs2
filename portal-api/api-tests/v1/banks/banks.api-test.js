const { ObjectId } = require('mongodb');
const { withDeleteOneTests, expectAnyPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const databaseHelper = require('../../database-helper');

const { as, get, post, put, remove } = require('../../api')(app);
const { expectMongoId, expectMongoIds } = require('../../expectMongoIds');
const bankController = require('../../../src/v1/controllers/banks.controller');
const { ADMIN } = require('../../../src/v1/roles/roles');

const aBank = require('./bank-builder');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const newBanks = ['112233', '112234', '112235'].map((id) => aBank({ id, name: `Bank${id}` }));

const updatedBank = aBank({
  id: newBanks[0].id,
  bankName: 'Updated bank name',
});

describe('/v1/banks', () => {
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.deleteBanks(newBanks.map(({ id }) => id));
  });

  describe('GET /v1/banks', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get('/v1/banks'),
      makeRequestWithAuthHeader: (authHeader) => get('/v1/banks', { headers: { Authorization: authHeader } }),
    });

    it('returns a list of banks', async () => {
      await as(anAdmin).postEach(newBanks).to('/v1/banks');

      const { status, body } = await as(anAdmin).get('/v1/banks');

      const expectedBanks = expectMongoIds(newBanks.map((bank) => ({ ...bank, auditRecord: expectAnyPortalUserAuditDatabaseRecord() })));
      expect(status).toEqual(200);
      expect(body.banks).toEqual(expect.arrayContaining(expectedBanks));
    });
  });

  describe('GET /v1/banks/:id', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(`/v1/banks/${newBanks[0]}`),
      makeRequestWithAuthHeader: (authHeader) => get(`/v1/banks/${newBanks[0]}`, { headers: { Authorization: authHeader } }),
    });

    it('returns a bank', async () => {
      await as(anAdmin).post(newBanks[0]).to('/v1/banks');

      const { status, body } = await as(anAdmin).get(`/v1/banks/${newBanks[0].id}`);

      const expectedBank = expectMongoId({ ...newBanks[0], auditRecord: expectAnyPortalUserAuditDatabaseRecord() });
      expect(status).toEqual(200);
      expect(body).toEqual(expectedBank);
    });
  });

  describe('POST /v1/banks', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post('/v1/banks', newBanks[0]),
      makeRequestWithAuthHeader: (authHeader) => post('/v1/banks', newBanks[0], { headers: { Authorization: authHeader } }),
    });

    it('accepts requests that present a valid Authorization token with "admin" role', async () => {
      const { status } = await as(anAdmin).post(newBanks[0]).to('/v1/banks');

      expect(status).toEqual(200);
    });
  });

  describe('PUT /v1/banks/:id', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => put(`/v1/banks/${newBanks[0].id}`, updatedBank),
      makeRequestWithAuthHeader: (authHeader) => put(`/v1/banks/${newBanks[0].id}`, updatedBank, { headers: { Authorization: authHeader } }),
    });

    it('updates the bank', async () => {
      await as(anAdmin).post(newBanks[0]).to('/v1/banks');
      await as(anAdmin).put(updatedBank).to(`/v1/banks/${newBanks[0].id}`);

      const { status, body } = await as(anAdmin).get(`/v1/banks/${newBanks[0].id}`);

      const expectedBank = expectMongoId({ ...updatedBank, auditRecord: expectAnyPortalUserAuditDatabaseRecord() });
      expect(status).toEqual(200);
      expect(body).toEqual(expectedBank);
    });
  });

  describe('DELETE /v1/banks/:id', () => {
    let bankToDeleteId;

    beforeEach(async () => {
      const { body } = await as(anAdmin).post(newBanks[0]).to('/v1/banks');
      bankToDeleteId = new ObjectId(body.insertedId);
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(`/v1/banks/${newBanks[0].id}`),
      makeRequestWithAuthHeader: (authHeader) => remove(`/v1/banks/${newBanks[0].id}`, { headers: { Authorization: authHeader } }),
    });

    withDeleteOneTests({
      makeRequest: () => as(anAdmin).remove(`/v1/banks/${newBanks[0].id}`),
      collectionName: MONGO_DB_COLLECTIONS.BANKS,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => bankToDeleteId,
    });
  });

  describe('Bank.Controller', () => {
    it('findOneBank returns a bank when no callback given', async () => {
      await as(anAdmin).post(newBanks[0]).to('/v1/banks');

      const bank = await bankController.findOneBank(newBanks[0].id);

      expect(bank).toMatchObject(newBanks[0]);
    });
  });
});

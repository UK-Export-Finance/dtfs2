const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { MAKER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('/v1/deals', () => {
  let aBarclaysMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('POST /v1/deals', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).post({}).to('/v1/deals');
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(2);
    });

    describe('bankInternalRefName', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const deal = {
            bankInternalRefName: '',
            additionalRefName: 'test name',
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Enter the Bank deal ID');
        });
      });

      describe('when more than 30 characters', () => {
        it('should return validationError', async () => {
          const deal = {
            bankInternalRefName: 'a'.repeat(31),
            additionalRefName: 'test name',
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankInternalRefName.text).toEqual('Bank deal ID must be 30 characters or fewer');
        });
      });
    });

    describe('additionalRefName', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const deal = {
            bankInternalRefName: 'test id',
            additionalRefName: '',
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Enter the Bank deal name');
        });
      });

      describe('when more than 100 characters', () => {
        it('should return validationError', async () => {
          const deal = {
            bankInternalRefName: 'test id',
            additionalRefName: 'a'.repeat(101),
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.additionalRefName.text).toEqual('Bank deal name must be 100 characters or fewer');
        });
      });
    });
  });
});

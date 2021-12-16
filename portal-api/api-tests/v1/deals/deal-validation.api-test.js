const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals', () => {
  let aBarclaysMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('POST /v1/deals', () => {
    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).post({}).to('/v1/deals');
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(2);
    });

    describe('bankSupplyContractID', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const deal = {
            details: {
              bankSupplyContractID: '',
              bankSupplyContractName: 'test name',
            },
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Enter the Bank deal ID');
        });
      });

      describe('when more than 30 characters', () => {
        it('should return validationError', async () => {
          const deal = {
            details: {
              bankSupplyContractID: 'a'.repeat(31),
              bankSupplyContractName: 'test name',
            },
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Bank deal ID must be 30 characters or fewer');
        });
      });
    });

    describe('bankSupplyContractName', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const deal = {
            details: {
              bankSupplyContractID: 'test id',
              bankSupplyContractName: '',
            },
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Enter the Bank deal name');
        });
      });

      describe('when more than 100 characters', () => {
        it('should return validationError', async () => {
          const deal = {
            details: {
              bankSupplyContractID: 'test id',
              bankSupplyContractName: 'a'.repeat(101),
            },
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Bank deal name must be 100 characters or fewer');
        });
      });
    });
  });
});

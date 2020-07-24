const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals', () => {
  let aBarclaysMaker;
  let dealId;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
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
            }
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
            }
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractID.text).toEqual('Bank deal ID must be 30 characters or fewer');
        });
      });

      describe('with an invalid character (not A-Z, 0-9, `-`, `_` or a space)', () => {
        it('should return validationError', async () => {
          let deal = {
            details: {
              bankSupplyContractID: 'invalid-format!@£$%^&*()+=',
              bankSupplyContractName: 'test name',
            }
          };

          const expectedText = 'Bank deal ID must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces';

          const firstPost = await as(aBarclaysMaker).post(deal).to('/v1/deals');
          expect(firstPost.body.validationErrors.errorList.bankSupplyContractID.text).toEqual(expectedText);

          deal = {
            details: {
              bankSupplyContractID: 'invalid-format{}:"|<>?,./;\'\[]',
              bankSupplyContractName: 'test name',
            }
          };
          const secondPost = await as(aBarclaysMaker).post(deal).to('/v1/deals');
          expect(secondPost.body.validationErrors.errorList.bankSupplyContractID.text).toEqual(expectedText);
        });
      });
    });

    describe('bankSupplyContractName', () => {
      describe('when missing', () => {
        it('should return validationError', async () => {
          const deal = {
            details: {
              bankSupplyContractID: 'test id',
              bankSupplyContractName: '' 
            }
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
            }
          };

          const { body } = await as(aBarclaysMaker).post(deal).to('/v1/deals');

          expect(body.validationErrors.errorList.bankSupplyContractName.text).toEqual('Bank deal name must be 100 characters or fewer');
        });
      });

      describe('with an invalid character (not A-Z, 0-9, `-`, `_` or a space)', () => {
        it('should return validationError', async () => {
          let deal = {
            details: {
              bankSupplyContractID: 'test id',
              bankSupplyContractName: 'invalid-format!@£$%^&*()+=',
            }
          };

          const expectedText = 'Bank deal name must only include letters a to z, numbers 0 to 9, hyphens, underscores and spaces';

          const firstPost = await as(aBarclaysMaker).post(deal).to('/v1/deals');
          expect(firstPost.body.validationErrors.errorList.bankSupplyContractName.text).toEqual(expectedText);

          deal = {
            details: {
              bankSupplyContractID: 'test id',
              bankSupplyContractName: 'invalid-format{}:"|<>?,./;\'\[]',
            }
          };
          const secondPost = await as(aBarclaysMaker).post(deal).to('/v1/deals');
          expect(secondPost.body.validationErrors.errorList.bankSupplyContractName.text).toEqual(expectedText);
        });
      });
    });
  });
});

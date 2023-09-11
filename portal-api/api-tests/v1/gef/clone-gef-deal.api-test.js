const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const mockApplications = require('../../fixtures/gef/application');
const api = require('../../../src/v1/api');
const CONSTANTS = require('../../../src/constants');

const baseUrl = '/v1/gef/application';
const collectionName = 'deals';

const mockApplication = {
  ...mockApplications[0],
  bankInternalRefName: 'Updated Ref Name - Unit Test',
  submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
};
const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

describe(baseUrl, () => {
  let aMaker;
  let anotherMaker;
  let aChecker;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aChecker = testUsers().withRole(CHECKER).one();
    aMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    anotherMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);

    api.tfmDealSubmit = tfmDealSubmitSpy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`POST ${baseUrl}/clone`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const mockDeal = await as(aMaker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;

      const { status } = await as().post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const mockDeal = await as(aMaker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: aMaker.bank.id };
      const { status } = await as(aMaker).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(200);
    });

    it('successfully clones a GEF deal and returns a new application ID', async () => {
      const mockDeal = await as(aMaker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: aMaker.bank.id };

      const { body } = await as(aMaker).post(mockApplication).to(`${baseUrl}/clone`);
      expect(body).toEqual({ dealId: expect.any(String) });
    });

    it('returns a `404` status if the maker belongs to a different bank', async () => {
      const mockDeal = await as(aMaker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: anotherMaker.bank.id };

      const { status } = await as(anotherMaker).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(404);
    });

    it('returns a `401` status if the user role is `Checker`', async () => {
      const mockDeal = await as(aChecker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;

      const { status } = await as(aChecker).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(401);
    });

    it('returns an error message when Bank Internal Ref Name is null', async () => {
      const mockDeal = await as(aMaker).post({
        dealType: 'GEF',
        maker: aMaker,
        bank: { id: aMaker.bank.id },
        bankInternalRefName: 'Bank 1',
        additionalRefName: 'Team 1',
        exporter: {},
        createdAt: '2021-01-01T00:00',
        mandatoryVersionId: '123',
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(baseUrl);

      const payload = {
        dealId: mockDeal.body._id,
        ...mockApplications[0],
        bankInternalRefName: null,
      };
      const { body, status } = await as(aMaker).post(payload).to(`${baseUrl}/clone`);
      expect(body).toEqual([{
        status: 422,
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'bankInternalRefName is Mandatory',
      }]);
      expect(status).toEqual(422);
    });

    it('returns an error message when Bank Internal Ref Name is an empty string', async () => {
      const payload = {
        ...mockApplications[0],
        bankInternalRefName: '',
      };
      const { body, status } = await as(aMaker).post(payload).to(`${baseUrl}/clone`);
      expect(body).toEqual([{
        status: 422,
        errCode: 'MANDATORY_FIELD',
        errRef: 'bankInternalRefName',
        errMsg: 'bankInternalRefName is Mandatory',
      }]);
      expect(status).toEqual(422);
    });
  });
});

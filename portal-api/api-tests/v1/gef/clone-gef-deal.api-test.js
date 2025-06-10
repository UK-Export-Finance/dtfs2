const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const mockApplications = require('../../fixtures/gef/application');
const api = require('../../../src/v1/api');
const CONSTANTS = require('../../../src/constants');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const baseUrl = '/v1/gef/application';
const eligibilityUrl = '/v1/gef/eligibility-criteria';
const collectionName = DB_COLLECTIONS.DEALS;

const mockApplication = {
  ...mockApplications[0],
  bankInternalRefName: 'Updated Ref Name - Unit Test',
  submissionType: CONSTANTS.DEAL.SUBMISSION_TYPE.AIN,
};
const { MAKER, CHECKER, ADMIN } = require('../../../src/v1/roles/roles');
const [gefEligibilityCriteria] = require('../../fixtures/gef/eligibilityCriteria');

describe(baseUrl, () => {
  let maker1;
  let maker2;
  let checker1;
  let anAdmin;
  const tfmDealSubmitSpy = jest.fn(() => Promise.resolve());

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    checker1 = testUsers().withRole(CHECKER).one();
    maker1 = testUsers().withRole(MAKER).withBankName('Bank 1').one();
    maker2 = testUsers().withRole(MAKER).withBankName('Bank 2').one();
    anAdmin = testUsers().withRole(ADMIN).one();

    /**
     * At least one `GEF` eligibility criteria version must exist to allow
     * GEF deal cloning.
     */
    as(anAdmin).post(gefEligibilityCriteria).to(eligibilityUrl);
  });

  beforeEach(async () => {
    await databaseHelper.wipe([collectionName]);

    api.tfmDealSubmit = tfmDealSubmitSpy;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe(`POST ${baseUrl}/clone`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;

      const { status } = await as().post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: maker1.bank.id };
      const { status } = await as(maker1).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(200);
    });

    it('successfully clones a GEF deal and returns a new application ID', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: maker1.bank.id };

      const { body } = await as(maker1).post(mockApplication).to(`${baseUrl}/clone`);
      expect(body).toEqual({ dealId: expect.any(String) });
    });

    it('successfully clones a GEF deal and updates the auditRecord', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: maker1.bank.id };

      const {
        status,
        body: { dealId },
      } = await as(maker1).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(200);

      const {
        body: { auditRecord },
      } = await as(maker1).get(`${baseUrl}/${dealId}`);

      expect(auditRecord).toEqual(generateParsedMockPortalUserAuditDatabaseRecord(maker1._id));
    });

    it('returns a `404` status if the maker belongs to a different bank', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;
      mockApplication.bank = { id: maker2.bank.id };

      const { status } = await as(maker2).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(404);
    });

    it('returns a `401` status if the user role is `Checker`', async () => {
      const mockDeal = await as(checker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      mockApplication.dealId = mockDeal.body._id;

      const { status } = await as(checker1).post(mockApplication).to(`${baseUrl}/clone`);
      expect(status).toEqual(401);
    });

    it('returns an error message when Bank Internal Ref Name is null', async () => {
      const mockDeal = await as(maker1)
        .post({
          dealType: 'GEF',
          maker: maker1,
          bank: { id: maker1.bank.id },
          bankInternalRefName: 'Bank 1',
          additionalRefName: 'Team 1',
          exporter: {},
          createdAt: '2021-01-01T00:00',
          mandatoryVersionId: '123',
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          updatedAt: null,
          submissionCount: 0,
        })
        .to(baseUrl);

      const payload = {
        dealId: mockDeal.body._id,
        ...mockApplications[0],
        bankInternalRefName: null,
      };
      const { body, status } = await as(maker1).post(payload).to(`${baseUrl}/clone`);
      expect(body).toEqual([
        {
          status: 422,
          errCode: 'MANDATORY_FIELD',
          errRef: 'bankInternalRefName',
          errMsg: 'bankInternalRefName is Mandatory',
        },
      ]);
      expect(status).toEqual(422);
    });

    it('returns an error message when Bank Internal Ref Name is an empty string', async () => {
      const payload = {
        ...mockApplications[0],
        bankInternalRefName: '',
      };
      const { body, status } = await as(maker1).post(payload).to(`${baseUrl}/clone`);
      expect(body).toEqual([
        {
          status: 422,
          errCode: 'MANDATORY_FIELD',
          errRef: 'bankInternalRefName',
          errMsg: 'bankInternalRefName is Mandatory',
        },
      ]);
      expect(status).toEqual(422);
    });
  });
});

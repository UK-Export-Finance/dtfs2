const { ObjectId } = require('mongodb');
const { withDeleteOneTests, expectAnyPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as, get, remove, postMultipartForm } = require('../../api')(app);
const { uploadFile, deleteFile, readFile } = require('../../../src/drivers/fileshare');
const CONSTANTS = require('../../../src/constants');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const baseUrl = '/v1/gef/files';

const applicationCollectionName = DB_COLLECTIONS.DEALS;
const applicationBaseUrl = '/v1/gef/application';

const validFiles = [
  {
    fieldname: 'files',
    filepath: 'api-tests/fixtures/test-file-1.txt',
  },
];

jest.mock('../../../src/drivers/fileshare', () => ({
  getConfig: jest.fn(() => ({ EXPORT_FOLDER: 'mock-folder' })),
  getDirectory: jest.fn(),
  uploadFile: jest.fn(() => ({})),
  deleteFile: jest.fn(),
  readFile: jest.fn(),
}));

describe(baseUrl, () => {
  const testBankName = 'Barclays Bank';
  let aMaker;
  let invalidMaker;
  let mockDeal;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).withBankName(testBankName).one();
    invalidMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();

    await databaseHelper.wipe([applicationCollectionName]);

    mockDeal = await as(aMaker)
      .post({
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
      })
      .to(applicationBaseUrl);
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FILES]);
  });

  describe(`POST ${baseUrl}`, () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () =>
        postMultipartForm({
          url: baseUrl,
          data: { parentId: mockDeal.body._id },
          files: [],
        }),
      makeRequestWithAuthHeader: (authHeader) =>
        postMultipartForm({
          url: baseUrl,
          data: { parentId: mockDeal.body._id },
          files: [],
          headers: { Authorization: authHeader },
        }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withBankName(testBankName).withRole(role).one(),
      makeRequestAsUser: (user) => as(user).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl),
      successStatusCode: 201,
    });

    it('rejects requests that are missing a parentId', async () => {
      const { status } = await as(aMaker).post({}).to(baseUrl);
      expect(status).toEqual(400);
    });

    it('rejects requests that have an invalid parentId', async () => {
      const { status } = await as(aMaker).post({ parentId: 'bad-url' }).to(baseUrl);
      expect(status).toEqual(400);
    });

    it('rejects requests that are missing files', async () => {
      const { status } = await as(aMaker)
        .post({ parentId: String(ObjectId()) })
        .to(baseUrl);
      expect(status).toEqual(400);
    });

    it('rejects requests where application does not exist', async () => {
      const { status } = await as(aMaker)
        .postMultipartForm({ parentId: String(ObjectId()) }, validFiles)
        .to(baseUrl);
      expect(status).toEqual(422);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { status } = await as(invalidMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      expect(status).toEqual(401);
    });

    it('shows errors for files that are invalid', async () => {
      const invalidFiles = [
        {
          fieldname: 'files',
          filepath: 'api-tests/fixtures/large-file.zip',
        },
        {
          fieldname: 'files',
          filepath: 'api-tests/fixtures/invalid-file.bat',
        },
      ];

      const { body, status } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, invalidFiles).to(baseUrl);

      expect(status).toEqual(400);
      expect(body).toEqual(
        expect.arrayContaining([expect.objectContaining({ message: expect.any(String) }), expect.objectContaining({ message: expect.any(String) })]),
      );
    });

    it('successfully posts a single file', async () => {
      const { status, body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      expect(status).toEqual(201);
      expect(body).toEqual(
        expect.arrayContaining([expect.objectContaining({ _id: expect.any(String) }), expect.objectContaining({ _id: expect.any(String) })]),
      );
    });

    it('posts 500 if there is an error', async () => {
      uploadFile.mockRejectedValueOnce('mock error');

      const { status } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      expect(status).toEqual(500);
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    let oneFileUrl;

    beforeEach(async () => {
      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);
      const createdId = body[0]._id;
      oneFileUrl = `${baseUrl}/${createdId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneFileUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneFileUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withBankName(testBankName).withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneFileUrl),
      successStatusCode: 200,
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/${String(ObjectId())}`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { status } = await as(invalidMaker).get(oneFileUrl);

      expect(status).toEqual(401);
    });

    it('returns file information when available', async () => {
      const { status } = await as(aMaker).get(oneFileUrl);

      expect(status).toEqual(200);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    let oneFileUrl;
    let fileToDeleteId;

    beforeEach(async () => {
      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);
      fileToDeleteId = body[0]._id;
      oneFileUrl = `${baseUrl}/${fileToDeleteId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => remove(oneFileUrl),
      makeRequestWithAuthHeader: (authHeader) => remove(oneFileUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER],
      getUserWithRole: (role) => testUsers().withBankName(testBankName).withRole(role).one(),
      makeRequestAsUser: (user) => as(user).remove(oneFileUrl),
      successStatusCode: 200,
    });

    withDeleteOneTests({
      makeRequest: () => as(aMaker).remove(oneFileUrl),
      collectionName: MONGO_DB_COLLECTIONS.FILES,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => new ObjectId(fileToDeleteId),
      expectedStatusWhenNoDeletion: 500,
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(ObjectId())}`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      const { status } = await as(invalidMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(401);
    });

    it('deletes the file', async () => {
      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      const { status } = await as(aMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(200);
    });

    it('returns 500 if there is an api error', async () => {
      deleteFile.mockRejectedValueOnce(new Error('mock error'));

      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      const { status } = await as(aMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(500);
    });
  });

  describe(`GET ${baseUrl}/:id/download`, () => {
    let oneFileDownloadUrl;

    beforeEach(async () => {
      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);
      const createdId = body[0]._id;
      oneFileDownloadUrl = `${baseUrl}/${createdId}/download`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneFileDownloadUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneFileDownloadUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withBankName(testBankName).withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneFileDownloadUrl),
      successStatusCode: 200,
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/${String(ObjectId())}/download`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { status } = await as(invalidMaker).get(oneFileDownloadUrl);

      expect(status).toEqual(401);
    });

    it('returns file stream when available', async () => {
      const TestData = Buffer.from('This is sample Test Data');
      readFile.mockResolvedValueOnce(TestData);

      const { body } = await as(aMaker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      const { status } = await as(aMaker).get(`${baseUrl}/${body[0]._id}/download`);

      expect(status).toEqual(200);
    });

    it('posts 500 if there is an error', async () => {
      readFile.mockRejectedValueOnce(new Error('mock error'));

      const { status } = await as(aMaker).get(oneFileDownloadUrl);

      expect(status).toEqual(500);
    });
  });
});

const { ObjectId } = require('mongodb');

const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { uploadFile, deleteFile, readFile } = require('../../../src/drivers/fileshare');
const CONSTANTS = require('../../../src/constants');

const baseUrl = '/v1/gef/files';
const collectionName = 'files';

const applicationCollectionName = 'deals';
const applicationBaseUrl = '/v1/gef/application';

const validFiles = [{
  fieldname: 'files',
  filepath: 'api-tests/fixtures/test-file-1.txt',
}];

jest.mock('../../../src/drivers/fileshare', () => ({
  getConfig: jest.fn(() => ({ EXPORT_FOLDER: 'mock-folder' })),
  getDirectory: jest.fn(),
  uploadFile: jest.fn(() => ({})),
  deleteFile: jest.fn(),
  readFile: jest.fn(),
}));

describe(baseUrl, () => {
  let aMaker;
  let aChecker;
  let invalidMaker;
  let mockDeal;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').withBankName('UKEF test bank (Delegated)').one();
    aChecker = testUsers().withRole('checker').withBankName('UKEF test bank (Delegated)').one();
    invalidMaker = testUsers().withRole('maker').withBankName('HSBC').one();

    await wipeDB.wipe([applicationCollectionName]);

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
        status: CONSTANTS.DEAL.GEF_STATUS.IN_PROGRESS,
        updatedAt: null,
        submissionCount: 0,
      }).to(applicationBaseUrl);
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
  });

  describe(`POST ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post({}).to(baseUrl);
      expect(status).toEqual(401);
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
      const { status } = await as(aMaker).post({ parentId: String(ObjectId()) }).to(baseUrl);
      expect(status).toEqual(400);
    });

    it('rejects requests where application does not exist', async () => {
      const { status } = await as(aMaker).postMultipartForm({ parentId: String(ObjectId()) }, validFiles).to(baseUrl);
      expect(status).toEqual(422);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { status } = await as(invalidMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      expect(status).toEqual(401);
    });

    it('rejects requests that do not have "maker" role', async () => {
      const { status } = await as(aChecker).postMultipartForm({ parentId: mockDeal.body._id }, validFiles).to(baseUrl);

      expect(status).toEqual(401);
    });

    it('shows errors for files that are invalid', async () => {
      uploadFile.mockResolvedValueOnce({ error: { message: 'upload error' } });

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

      const { status, body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, invalidFiles)
        .to(baseUrl);

      expect(status).toEqual(200);
      expect(body).toEqual(expect.arrayContaining([
        expect.objectContaining({ error: expect.any(String) }),
        expect.objectContaining({ error: expect.any(String) }),
        expect.objectContaining({ error: expect.any(String) }),
      ]));
    });

    it('successfully posts a single file', async () => {
      const { status, body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      expect(status).toEqual(201);
      expect(body).toEqual(expect.arrayContaining([
        expect.objectContaining({ _id: expect.any(String) }),
        expect.objectContaining({ _id: expect.any(String) }),
      ]));
    });

    it('posts 500 if there is an error', async () => {
      uploadFile.mockRejectedValueOnce('mock error');

      const { status } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      expect(status).toEqual(500);
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/${String(ObjectId())}`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(invalidMaker).get(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(401);
    });

    it('returns file information when available', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(aMaker).get(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(200);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(ObjectId())}`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(invalidMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(401);
    });

    it('rejects requests that aare not by a maker', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(aChecker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(401);
    });

    it('deletes the file', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(aMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(200);
    });

    it('returns 500 if there is an api error', async () => {
      deleteFile.mockRejectedValueOnce(new Error('mock error'));

      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(aMaker).remove(`${baseUrl}/${body[0]._id}`);

      expect(status).toEqual(500);
    });
  });

  describe(`GET ${baseUrl}/:id/download`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1/download`);
      expect(status).toEqual(401);
    });

    it('returns 404 if files is not found', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/${String(ObjectId())}/download`);
      expect(status).toEqual(404);
    });

    it('rejects requests that do not have access to deal', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(invalidMaker).get(`${baseUrl}/${body[0]._id}/download`);

      expect(status).toEqual(401);
    });

    it('returns file stream when available', async () => {
      const TestData = Buffer.from('This is sample Test Data');
      readFile.mockResolvedValueOnce(TestData);

      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      const { status } = await as(aMaker).get(`${baseUrl}/${body[0]._id}/download`);

      expect(status).toEqual(200);
    });

    it('posts 500 if there is an error', async () => {
      const { body } = await as(aMaker)
        .postMultipartForm({ parentId: mockDeal.body._id }, validFiles)
        .to(baseUrl);

      readFile.mockRejectedValueOnce(new Error('mock error'));

      const { status } = await as(aMaker).get(`${baseUrl}/${body[0]._id}/download`);

      expect(status).toEqual(500);
    });
  });
});

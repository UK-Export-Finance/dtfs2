const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const eligibilityCriteriaCache = require('../../api-test-eligibilityCriteria');

const { as } = require('../../api')(app);
const {
  updatedECCompleted,
} = require('./mocks');

const newDeal = aDeal({ id: 'dealApiTest', additionalRefName: 'Original Value' });

describe('/v1/deals/:id/eligibility-documentation', () => {
  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    anEditor = testUsers().withRole('editor').one();

    await eligibilityCriteriaCache.initialise(app, anEditor);
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('PUT /v1/deals/:id/eligibility-documentation', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await as(noRoles).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await as(noRoles).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('401s requests if user tries to update deal it doesn\'t have permission for', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await as(anHSBCMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('updates eligibility status depending on whether validation errors occur', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      // Update deal so it requires manual inclusion questionnaire
      const updatedDeal = await as(aBarclaysMaker).put(updatedECCompleted).to(`/v1/deals/${newId}/eligibility-criteria`);
      expect(updatedDeal.body.eligibility.status).toEqual('Incomplete');

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const updatedValidDeal = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);
      expect(updatedValidDeal.status).toEqual(200);
      expect(updatedValidDeal.body.eligibility.status).toEqual('Completed');

      // Removing exporterQuestionnaire should change status to incomplete
      const filePath = updatedValidDeal.body.supportingInformation[fieldname][0].fullPath;
      const deleteFileData = {
        deleteFile: filePath,
      };

      const updatedInvalidDeal = await as(aBarclaysMaker).putMultipartForm(deleteFileData, []).to(`/v1/deals/${newId}/eligibility-documentation`);
      expect(updatedInvalidDeal.status).toEqual(200);
      expect(updatedInvalidDeal.body.eligibility.status).toEqual('Incomplete');
    });

    it('uploads a file with the correct type', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test_file_1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname][0]).toMatchObject({
        filename,
        fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/${filename}`,
        type,
      });
    });

    it('returns validation error if file exceeds max file size', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'large-file.zip';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);

      expect(body.supportingInformation[fieldname]).toBeUndefined();

      expect(body.supportingInformation.validationErrors.errorList[fieldname]).toBeDefined();
      expect(body.supportingInformation.validationErrors.errorList[fieldname].text).toMatch(`${filename} could not be saved`);
    });

    it('returns validation error if file extension is not allowed', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'invalid-file.bat';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);

      expect(body.supportingInformation[fieldname]).toBeUndefined();

      expect(body.supportingInformation.validationErrors.errorList[fieldname]).toBeDefined();
      expect(body.supportingInformation.validationErrors.errorList[fieldname].text).toMatch(`${filename} file type is not allowed`);
    });

    it('uploads multiple files from same fieldname with the correct type', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const fieldname = 'auditedFinancialStatements';

      const files = [
        {
          filename: 'test_file_1.txt',
          filepath: 'api-tests/fixtures/test_file_1.txt',
          fieldname,
          type: 'financials',
        },
        {
          filename: 'test_file_2.txt',
          filepath: 'api-tests/fixtures/test_file_2.txt',
          fieldname,
          type: 'financials',
        },
      ];

      const expectedFiles = files.map(({ filename, type }) => ({
        filename,
        fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/${filename}`,
        type,
      }));

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname].length).toEqual(files.length);
      expect(body.supportingInformation[fieldname]).toMatchObject(expectedFiles);
    });

    it('uploads files from different fieldname with the correct type', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const files = [
        {
          filename: 'test_file_1.txt',
          filepath: 'api-tests/fixtures/test_file_1.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test_file_2.txt',
          filepath: 'api-tests/fixtures/test_file_2.txt',
          fieldname: 'auditedFinancialStatements',
          type: 'financials',
        },
      ];

      const expectedFiles = files.map(({ filename, fieldname, type }) => ([{
        filename,
        fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/${filename}`,
        type,
      }]));

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[files[0].fieldname].length).toEqual(1);
      expect(body.supportingInformation[files[0].fieldname]).toMatchObject(expectedFiles[0]);

      expect(body.supportingInformation[files[1].fieldname].length).toEqual(1);
      expect(body.supportingInformation[files[1].fieldname]).toMatchObject(expectedFiles[1]);
    });

    it('does not create duplicate entry if same file is reuploaded', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname].length).toEqual(1);
    });

    it('downloads an uploaded file', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);
      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/${newId}/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(200);
      expect(header['content-disposition']).toEqual(`attachment; filename=${filename}`);
      expect(text).toEqual('mockFile');
    });

    it('does not allow download of file from a different user organisation', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);
      const { status, text, header } = await as(anHSBCMaker).get(`/v1/deals/${newId}/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(401);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it('returns 404 if deal doesn\'t exist', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);
      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/620a1aa095a618b12da38c7b/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it('returns 404 if no deal files have been uploaded', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';

      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/${newId}/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it('returns 404 is requested file doesn\'t exist', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);
      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/${newId}/eligibility-documentation/${fieldname}/non-exisitant-file.txt`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it('deletes an uploaded file', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const uploadedDealRes = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const filePath = uploadedDealRes.body.supportingInformation[fieldname][0].fullPath;

      const deleteFileData = {
        deleteFile: filePath,
      };

      const { status, body } = await as(aBarclaysMaker).putMultipartForm(deleteFileData, []).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname].length).toEqual(0);
    });

    it('deletes multiple uploaded files', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const files = [
        {
          filename: 'test-file-1.txt',
          filepath: 'api-tests/fixtures/test-file-1.txt',
          fieldname: 'exporterQuestionnaire',
          type: 'general_correspondence',
        },
        {
          filename: 'test-file-2.txt',
          filepath: 'api-tests/fixtures/test-file-2.txt',
          fieldname: 'auditedFinancialStatements',
          type: 'financials',
        },
      ];

      const uploadedDealRes = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const { supportingInformation } = uploadedDealRes.body;

      const deleteFileData = {
        deleteFile: [
          supportingInformation.exporterQuestionnaire[0].filename,
          supportingInformation.auditedFinancialStatements[0].filename,
        ],
      };

      const { status, body } = await as(aBarclaysMaker).putMultipartForm(deleteFileData, []).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      files.forEach((f) => {
        expect(body.supportingInformation[f.fieldname].length).toEqual(0);
      });
    });

    it('saves security text field', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const textFields = {
        security: 'security text'
      };

      const { status, body } = await as(aBarclaysMaker).putMultipartForm(textFields).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation.securityDetails.exporter).toEqual(textFields.security);
    });
  });
});

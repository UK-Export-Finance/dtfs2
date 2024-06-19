const databaseHelper = require('../../database-helper');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const eligibilityCriteriaCache = require('../../api-test-eligibilityCriteria');

const { as, get } = require('../../api')(app);
const { updatedECCompleted } = require('./mocks');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newDeal = aDeal({ id: 'dealApiTest', additionalRefName: 'Original Value' });

describe('/v1/deals/:id/eligibility-documentation', () => {
  let aBarclaysMaker;
  let anHSBCMaker;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();
    anAdmin = testUsers().withRole(ADMIN).one();

    await eligibilityCriteriaCache.initialise(app, anAdmin);
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/deals/:id/eligibility-documentation/:fieldname/:filename', () => {
    const filename = 'test-file-1.txt';
    const fieldname = 'exporterQuestionnaire';
    const type = 'general_correspondence';

    const files = [
      {
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      },
    ];

    let dealId;
    let aBarclaysEligibilityDocumentationFileUrl;

    beforeEach(async () => {
      const {
        body: { _id: createdDealId },
      } = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = createdDealId;

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${dealId}/eligibility-documentation`);

      aBarclaysEligibilityDocumentationFileUrl = `/v1/deals/${dealId}/eligibility-documentation/${fieldname}/${filename.replaceAll(/-/g, '_')}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aBarclaysEligibilityDocumentationFileUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aBarclaysEligibilityDocumentationFileUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName('Barclays Bank').one(),
      makeRequestAsUser: (user) => as(user).get(aBarclaysEligibilityDocumentationFileUrl),
      successStatusCode: 200,
    });

    it('downloads an uploaded file', async () => {
      const { status, text, header } = await as(aBarclaysMaker).get(aBarclaysEligibilityDocumentationFileUrl);

      expect(status).toEqual(200);
      expect(header['content-disposition']).toEqual(`attachment; filename=${filename.replaceAll(/-/g, '_')}`);
      expect(text).toEqual('mockFile');
    });

    it('does not allow download of file from a different user organisation', async () => {
      const { status, text, header } = await as(anHSBCMaker).get(aBarclaysEligibilityDocumentationFileUrl);

      expect(status).toEqual(401);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it("returns 404 if deal doesn't exist", async () => {
      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/620a1aa095a618b12da38c7b/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it('returns 404 if no deal files have been uploaded', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/${newId}/eligibility-documentation/${fieldname}/${filename}`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });

    it("returns 404 is requested file doesn't exist", async () => {
      const { status, text, header } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/eligibility-documentation/${fieldname}/non-exisitant-file.txt`);

      expect(status).toEqual(404);
      expect(header['content-disposition']).toBeUndefined();
      expect(text).toEqual('');
    });
  });

  describe('PUT /v1/deals/:id/eligibility-documentation', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

      const { status } = await as(testUsers).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

      const { status } = await as(testUsers).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it("401s requests if user tries to update deal it doesn't have permission for", async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

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

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

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

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname][0]).toMatchObject({
        filename: 'test_file_1.txt',
        fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/test_file_1.txt`,
        type,
      });
    });

    it('returns validation error if file exceeds max file size and is not allowed to be uploaded', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'large-file.zip';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);

      expect(body.supportingInformation[fieldname]).toBeUndefined();

      expect(body.supportingInformation.validationErrors.errorList[fieldname]).toBeDefined();
      expect(body.supportingInformation.validationErrors.errorList[fieldname].text).toMatch(`${filename} file type is not allowed`);
    });

    it('returns validation error if file extension is not allowed', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'invalid-file.bat';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

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
          filename: 'test-file-1.txt',
          filepath: 'api-tests/fixtures/test-file-1.txt',
          fieldname,
          type: 'financials',
        },
        {
          filename: 'test-file-2.txt',
          filepath: 'api-tests/fixtures/test-file-2.txt',
          fieldname,
          type: 'financials',
        },
      ];

      const expectedFiles = files.map(({ filename, type }) => ({
        filename: filename.replaceAll(/-/g, '_'),
        fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/${filename.replaceAll(/-/g, '_')}`,
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

      // eslint-disable-next-line no-unused-vars
      const expectedFiles = files.map(({ filename, fieldname, type }) => [
        {
          filename: filename.replaceAll(/-/g, '_'),
          fullPath: `${process.env.AZURE_PORTAL_EXPORT_FOLDER}/${newId}/${filename.replaceAll(/-/g, '_')}`,
          type,
        },
      ]);

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

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

      await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const { status, body } = await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation[fieldname].length).toEqual(1);
    });

    it('deletes an uploaded file', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [
        {
          fieldname,
          filepath: `api-tests/fixtures/${filename}`,
          type,
        },
      ];

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
        deleteFile: [supportingInformation.exporterQuestionnaire[0].filename, supportingInformation.auditedFinancialStatements[0].filename],
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
        security: 'security text',
      };

      const { status, body } = await as(aBarclaysMaker).putMultipartForm(textFields).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.supportingInformation.securityDetails.exporter).toEqual(textFields.security);
    });
  });
});

const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const {
  post, put, putMultipartForm,
} = require('../../api')(app);

const getToken = require('../../getToken')(app);

let aUserWithoutRoles;
let user1;
let user2;

describe('/v1/deals/:id/eligibility-documentation', () => {
  const newDeal = aDeal({ id: 'dealApiTest', bankSupplyContractName: 'Original Value' });

  beforeEach(async () => {
    await wipeDB.wipe(['deals', 'users']);

    aUserWithoutRoles = await getToken({
      username: '1',
      password: '2',
      roles: [],
    });

    user1 = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Mammon',
      },
    });

    user2 = await getToken({
      username: '5',
      password: '6',
      roles: ['maker'],
      bank: {
        id: '2',
        name: 'Temple of cash',
      },
    });
  });

  describe('PUT /v1/deals/:id/eligibility-documentation', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await putMultipartForm({}, null, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await putMultipartForm({}, aUserWithoutRoles, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('401s requests if user tries to update deal it doesn\'t have permission for', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status } = await putMultipartForm({}, user2, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(401);
    });

    it('uploads a file with the correct type', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      const { status, body } = await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles[fieldname][0]).toMatchObject({
        filename,
        fullPath: `${newId}/${fieldname}/${filename}`,
        type,
      });
    });

    it('uploads multiple files from same fieldname with the correct type', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const fieldname = 'financialStatements';

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
        filename,
        fullPath: `${newId}/${fieldname}/${filename}`,
        type,
      }));

      const { status, body } = await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles[fieldname].length).toEqual(files.length);
      expect(body.dealFiles[fieldname]).toMatchObject(expectedFiles);
    });

    it('uploads files from different fieldname with the correct type', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
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
          fieldname: 'financialStatements',
          type: 'financials',
        },
      ];

      const expectedFiles = files.map(({ filename, fieldname, type }) => ([{
        filename,
        fullPath: `${newId}/${fieldname}/${filename}`,
        type,
      }]));

      const { status, body } = await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles[files[0].fieldname].length).toEqual(1);
      expect(body.dealFiles[files[0].fieldname]).toMatchObject(expectedFiles[0]);

      expect(body.dealFiles[files[1].fieldname].length).toEqual(1);
      expect(body.dealFiles[files[1].fieldname]).toMatchObject(expectedFiles[1]);
    });

    it('does not create duplicate entry if same file is reuploaded', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];

      await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const { status, body } = await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles[fieldname].length).toEqual(1);
    });

    it('deletes an uploaded file', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';
      const type = 'general_correspondence';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
        type,
      }];


      const uploadedDealRes = await putMultipartForm({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      const filePath = uploadedDealRes.body.dealFiles[fieldname][0].fullPath;

      const deleteFileData = {
        deleteFile: [filePath],
      };

      const { status, body } = await putMultipartForm(deleteFileData, user1, []).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles[fieldname].length).toEqual(0);
    });
  });
});

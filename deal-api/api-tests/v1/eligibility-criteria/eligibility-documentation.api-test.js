const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');

const app = require('../../../src/createApp');
const {
  post, putWithFileUploads,
} = require('../../api')(app);

const getToken = require('../../getToken')(app);


jest.mock('@azure/storage-file-share', () => {
  const mockCreate = jest.fn().mockImplementation(() => ({
    catch: jest.fn(),
  }));

  return {
    ShareServiceClient: jest.fn().mockImplementation(() => ({
      getShareClient: jest.fn().mockImplementation(() => ({
        create: mockCreate,
        getDirectoryClient: jest.fn().mockImplementation(() => ({
          create: mockCreate,
          getDirectoryClient: jest.fn().mockImplementation(() => ({
            create: mockCreate,
            getFileClient: jest.fn().mockImplementation(() => ({
              uploadStream: jest.fn(),
            })),
          })),
        })),
      })),
    })),
    StorageSharedKeyCredential: jest.fn(),
  };
});

let user1;

describe('/v1/deals/:id/eligibility-documentation', () => {
  const newDeal = aDeal({ id: 'dealApiTest', bankSupplyContractName: 'Original Value' });

  beforeEach(async () => {
    await wipeDB();

    user1 = await getToken({
      username: '3',
      password: '4',
      roles: ['maker'],
      bank: {
        id: '1',
        name: 'Mammon',
      },
    });
  });

  describe('PUT /v1/deals/:id/eligibility-documentation', () => {
    it('uploads a file', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filename = 'test-file-1.txt';
      const fieldname = 'exporterQuestionnaire';

      const files = [{
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
      }];

      const { status, body } = await putWithFileUploads({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles.exporterQuestionnaire[0]).toMatchObject({
        filename,
        fullPath: `${newId}/${fieldname}/${filename}`,
      });
    });

    it('uploads multiple files', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const newId = postResult.body._id;

      const filenames = ['test-file-1.txt', 'test-file-2.txt'];
      const fieldname = 'exporterQuestionnaire';

      const files = filenames.map((filename) => ({
        fieldname,
        filepath: `api-tests/fixtures/${filename}`,
      }));

      const expectedFiles = filenames.map((filename) => ({
        filename,
        fullPath: `${newId}/${fieldname}/${filename}`,
      }));

      const { status, body } = await putWithFileUploads({}, user1, files).to(`/v1/deals/${newId}/eligibility-documentation`);

      expect(status).toEqual(200);
      expect(body.dealFiles.exporterQuestionnaire.length).toEqual(filenames.length);
      expect(body.dealFiles.exporterQuestionnaire).toMatchObject(expectedFiles);
    });
  });
});

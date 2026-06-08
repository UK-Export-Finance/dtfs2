const stream = require('stream');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER, CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');

const { get } = createApi(app);

const fileId = '321';

const createFileStream = () => {
  const fileStream = new stream.PassThrough();
  fileStream.headers = { 'content-type': 'application/pdf' };
  fileStream.end(Buffer.from('file-contents'));
  return fileStream;
};

describe('downloadFile routes', () => {
  beforeEach(() => {
    api.downloadFile.mockImplementation(() => createFileStream());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /file/:fileId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/file/${fileId}`, {}, headers),
      whitelistedRoles: [MAKER, CHECKER],
      successCode: HttpStatusCode.Ok,
    });
  });
});

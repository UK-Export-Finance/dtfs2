const { when } = require('jest-when');
const { saveFileToAzure } = require('./utilisation-report-upload.controller');
const { uploadFile } = require('../../../drivers/fileshare');
const { MOCK_FILE_INFO } = require('../../../../test-helpers/mock-azure-file-info');

jest.mock('../../../drivers/fileshare', () => ({ uploadFile: jest.fn() }));

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  const file = {
    originalname: 'test_file.csv',
    buffer: Buffer.from('test'),
  };

  const bankId = '111';

  describe('saveFileToAzure', () => {
    it('should return file info when azure file upload does not error', async () => {
      when(uploadFile)
        .calledWith(expect.anything())
        .mockImplementationOnce(() => MOCK_FILE_INFO);

      const { fileInfo, error } = await saveFileToAzure(file, bankId);

      expect(fileInfo).toEqual(MOCK_FILE_INFO);
      expect(error).toEqual(false);
    });

    it('should return error: true when azure file upload throws an error', async () => {
      when(uploadFile)
        .calledWith(expect.anything())
        .mockImplementationOnce(() => { throw new Error(); });

      const { fileInfo, error } = await saveFileToAzure(file, bankId);

      expect(fileInfo).toEqual(null);
      expect(error).toEqual(true);
    });
  });
});

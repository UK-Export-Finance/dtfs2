const { when } = require('jest-when');
const { saveFileToAzure } = require('./utilisation-report-upload.controller');
const { uploadFile } = require('../../../drivers/fileshare');

jest.mock('../../../drivers/fileshare', () => ({ uploadFile: jest.fn() }));

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  const file = {
    originalname: 'test_file.csv',
    buffer: Buffer.from('test'),
  };

  const bankId = '111';

  const mockFileUpload = {
    folder: 'folder_name',
    filename: 'test_file.csv',
    fullPath: 'folder_name/test_file.csv',
    url: 'https://azure/utilisation-reports/folder_name/test_file.csv',
  };

  describe('saveFileToAzure', () => {
    it('should return file info when azure file upload does not error', async () => {
      when(uploadFile)
        .calledWith(expect.anything())
        .mockImplementationOnce(() => mockFileUpload);

      const { fileInfo, error } = await saveFileToAzure(file, bankId);

      expect(fileInfo).toEqual(mockFileUpload);
      expect(error).toEqual(false);
    });

    it('should return error: true when azure file upload throws an error', async () => {
      when(uploadFile)
        .calledWith(expect.anything())
        .mockImplementationOnce(() => { throw new Error() });

      const { fileInfo, error } = await saveFileToAzure(file, bankId);

      expect(fileInfo).toEqual(null);
      expect(error).toEqual(true);
    });
  });
});

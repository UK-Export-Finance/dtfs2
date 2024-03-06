const { when } = require('jest-when');
const { saveFileToAzure } = require('./utilisation-report-upload.controller');
const { uploadFile } = require('../../../drivers/fileshare');
const { MOCK_FILE_INFO } = require('../../../../test-helpers/mock-azure-file-info');

console.error = jest.fn();
console.info = jest.fn();

jest.mock('../../../drivers/fileshare', () => ({ uploadFile: jest.fn() }));

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  const file = {
    originalname: 'test_file.csv',
    buffer: Buffer.from('test'),
  };

  const bankId = '111';

  describe('saveFileToAzure', () => {
    it('should return file info when azure file upload does not error', async () => {
      // Arrange
      when(uploadFile)
        .calledWith(expect.anything())
        .mockImplementationOnce(() => MOCK_FILE_INFO);

      // Act
      const fileInfo = await saveFileToAzure(file, bankId);

      // Assert
      expect(fileInfo).toEqual(MOCK_FILE_INFO);
    });

    it('should throw an error when the uploadFile response is false', async () => {
      // Arrange
      when(uploadFile).calledWith(expect.anything()).mockResolvedValueOnce(false);

      // Act / Assert
      await expect(saveFileToAzure(file, bankId)).rejects.toThrow('Failed to save utilisation report to Azure - cause unknown');
    });

    it('should throw an error when the uploadFile response is an error object', async () => {
      // Arrange
      const errorObject = {
        errorCount: 1,
        error: { errorCode: 'SOME_ERROR', message: 'invalid file' },
      };
      when(uploadFile).calledWith(expect.anything()).mockResolvedValueOnce(errorObject);

      // Act / Assert
      await expect(saveFileToAzure(file, bankId)).rejects.toThrow(`Failed to save utilisation report to Azure - ${errorObject.error.message}`);
    });

    it('should rethrow the error when uploadFile throws', async () => {
      // Arrange
      const uploadFileError = new Error('File is invalid');
      when(uploadFile).calledWith(expect.anything()).mockRejectedValueOnce(uploadFileError);

      // Act / Assert
      await expect(saveFileToAzure(file, bankId)).rejects.toThrow(uploadFileError);
    });
  });
});

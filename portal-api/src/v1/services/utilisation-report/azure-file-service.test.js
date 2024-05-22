const { saveUtilisationReportFileToAzure } = require('./azure-file-service');
const { uploadFile } = require('../../../drivers/fileshare');
const { MOCK_FILE_INFO } = require('../../../../test-helpers/mock-azure-file-info');

console.error = jest.fn();
console.info = jest.fn();

jest.mock('../../../drivers/fileshare');

describe('saveUtilisationReportFileToAzure', () => {
  const file = {
    originalname: 'test_file.csv',
    buffer: Buffer.from('test'),
    mimetype: 'text/csv',
  };

  const bankId = '111';
  it('should return file info when azure file upload does not error', async () => {
    // Arrange
    jest.mocked(uploadFile).mockImplementationOnce(() => MOCK_FILE_INFO);

    // Act
    const fileInfo = await saveUtilisationReportFileToAzure(file, bankId);

    // Assert
    expect(fileInfo).toEqual({ ...MOCK_FILE_INFO, mimetype: 'text/csv' });
  });

  it('should throw an error when the uploadFile response is false', async () => {
    // Arrange
    jest.mocked(uploadFile).mockResolvedValueOnce(false);

    // Act / Assert
    await expect(saveUtilisationReportFileToAzure(file, bankId)).rejects.toThrow('Failed to save utilisation report to Azure - cause unknown');
  });

  it('should throw an error when the uploadFile response is an error object', async () => {
    // Arrange
    const errorObject = {
      errorCount: 1,
      error: { errorCode: 'SOME_ERROR', message: 'invalid file' },
    };
    jest.mocked(uploadFile).mockResolvedValueOnce(errorObject);

    // Act / Assert
    await expect(saveUtilisationReportFileToAzure(file, bankId)).rejects.toThrow(`Failed to save utilisation report to Azure - ${errorObject.error.message}`);
  });

  it('should rethrow the error when uploadFile throws', async () => {
    // Arrange
    const uploadFileError = new Error('File is invalid');
    jest.mocked(uploadFile).mockRejectedValueOnce(uploadFileError);

    // Act / Assert
    await expect(saveUtilisationReportFileToAzure(file, bankId)).rejects.toThrow(uploadFileError);
  });
});

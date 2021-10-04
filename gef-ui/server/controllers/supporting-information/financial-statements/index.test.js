import {
  getUploadFinancialStatements, postUploadFinancialStatements, uploadFinancialStatements, deleteFinancialStatements,
} from '.';
import Application from '../../../models/application';
import validateFile from '../../../utils/validateFile';
import { uploadAndSaveToDeal, removeFileFromDeal } from '../../../utils/fileUtils';

jest.mock('../../../models/application');
jest.mock('../../../utils/validateFile', () => jest.fn(() => [true, null]));
jest.mock('../../../utils/fileUtils');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.sendStatus = jest.fn();
  res.status = jest.fn(() => res);
  res.render = jest.fn();
  res.send = jest.fn();
  return res;
};

const MockApplication = () => ({
  _id: 'mock-id',
  supportingInformation: {},
});

describe('controllers/financial-statements', () => {
  const mockResponse = new MockResponse();
  let mockRequest;
  Application.findById.mockResolvedValue(new MockApplication());

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUploadManualInclusion', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          applicationId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
      };
    });

    it('redirects user to dashboard if they do not have access to application', async () => {
      Application.findById.mockResolvedValueOnce();

      await getUploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.any(String));
    });

    it('renders the manual inclusion questionnaire page as expected', async () => {
      Application.findById.mockResolvedValueOnce({
        supportingInformation: {
          financialStatements: [{
            _id: 'mockFileId',
            filename: 'mock-file.pdf',
          }],
        },
      });

      await getUploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).not.toHaveBeenCalledWith('partials/financial-statements.njk', {
        applicationId: 'mock-id',
        files: [{
          _id: 'mockFileId',
          filename: 'mock-file.pdf',
        }],
      });
    });
  });

  describe('postUploadFinancialStatements', () => {
    beforeEach(() => {
      mockRequest = {
        body: {},
        params: {
          applicationId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
      };
    });

    it('redirects user to dashboard if they do not have access to application', async () => {
      Application.findById.mockResolvedValueOnce();

      await postUploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(expect.any(String));
    });

    describe('files', () => {
      beforeEach(() => {
        mockRequest.files = [{
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
        }];
      });

      it('handles file errors without calling upload', async () => {
        validateFile.mockReturnValueOnce([false, 'mock error']);

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#mock-file.pdf', text: expect.any(String) },
            ]),
          }),
          files: [{
            filename: 'mock-file.pdf',
            originalname: 'mock-file.pdf',
            error: 'mock error',
          }],
          applicationId: 'mock-id',
        }));
      });

      it('handles a mix of valid and invalid files', async () => {
        mockRequest.files = [
          {
            originalname: 'mock-file.pdf',
          },
          {
            filename: 'another-file.pdf',
            originalname: 'another-file.pdf',
          },
        ];

        validateFile.mockReturnValueOnce([false, 'mock error']).mockReturnValueOnce([true, null]);

        uploadAndSaveToDeal.mockResolvedValue([{
          _id: 'mock-file-id',
          filename: 'another-file.pdf',
          originalname: 'another-file.pdf',
        }]);

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#mock-file.pdf', text: expect.any(String) },
            ]),
          }),
          files: [
            {
              originalname: 'mock-file.pdf',
              error: 'mock error',
            },
            {
              _id: 'mock-file-id',
              filename: 'another-file.pdf',
              originalname: 'another-file.pdf',
            },
          ],
          applicationId: 'mock-id',
        }));
      });
    });

    describe('delete', () => {
      beforeEach(() => {
        mockRequest.body = { delete: 'mock-file.pdf' };
      });

      it('returns error if error thrown when deleting', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            financialStatements: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        removeFileFromDeal.mockRejectedValueOnce(new Error('mock thrown error'));

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          applicationId: 'mock-id',
        }));
      });

      it('deletes a file from application if ID passed', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            financialStatements: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        removeFileFromDeal.mockResolvedValueOnce();

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.not.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
        }));
      });
    });

    describe('submit', () => {
      beforeEach(() => {
        mockRequest.body = { submit: 'true' };
      });

      it('returns error if uploads are empty', async () => {
        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          applicationId: 'mock-id',
        }));
      });

      it('returns error if there are more than 20 files', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            financialStatements: new Array(21).fill({}).map((_, i) => ({
              _id: `mockFileId${i}`,
              filename: `mock-file-${i}.pdf`,
            })),
          },
        });

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/financial-statements.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          applicationId: 'mock-id',
        }));
      });

      it('redirects to next question if there is between 1 and 20 files', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            financialStatements: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        await postUploadFinancialStatements(mockRequest, mockResponse);

        expect(mockResponse.render).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith(expect.any(String));
      });
    });
  });

  describe('uploadFinancialStatements', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          applicationId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
        file: {
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
        },
      };
    });

    it('returns an error if file is not present', async () => {
      mockRequest.file = null;

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
      expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
    });

    it('does not upload file if it is invalid', async () => {
      validateFile.mockReturnValueOnce([false, 'mock file error']);

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: {
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
          error: 'mock file error',
        },
        error: { message: 'mock file error' },
      });
      expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
    });

    it('returns unauthorised if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
    });

    it('returns any upload errors', async () => {
      uploadAndSaveToDeal.mockResolvedValueOnce([{
        filename: 'mock-file.pdf',
        originalname: 'mock-file.pdf',
        error: 'mock upload error',
      }]);

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: {
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
          error: 'mock upload error',
        },
        error: { message: 'mock upload error' },
      });
    });

    it('returns error if error thrown when uploading', async () => {
      uploadAndSaveToDeal.mockRejectedValueOnce('mock thrown error');

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: {
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
          error: 'mock-file.pdf could not be uploaded',
        },
        error: { message: 'mock-file.pdf could not be uploaded' },
      });
    });

    it('returns file with success message if everything valid', async () => {
      uploadAndSaveToDeal.mockResolvedValueOnce([{
        _id: 'mock-file-id',
        filename: 'mock-file.pdf',
        originalname: 'mock-file.pdf',
      }]);

      await uploadFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: {
          _id: 'mock-file-id',
          filename: 'mock-file.pdf',
          originalname: 'mock-file.pdf',
        },
        success: { messageHtml: 'mock-file.pdf' },
      });
    });
  });

  describe('deleteFinancialStatements', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          applicationId: 'mock-id',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
        body: {
          delete: 'mock-file.pdf',
        },
      };
    });

    it('returns an error if no delete value present', async () => {
      mockRequest.body = {};

      await deleteFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
      expect(removeFileFromDeal).not.toHaveBeenCalled();
    });

    it('returns unauthorised if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await deleteFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(removeFileFromDeal).not.toHaveBeenCalled();
    });

    it('returns error if error thrown when deleting', async () => {
      removeFileFromDeal.mockRejectedValueOnce('mock thrown error');

      await deleteFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(500);
    });

    it('removes file with success message if everything valid', async () => {
      removeFileFromDeal.mockResolvedValueOnce();

      await deleteFinancialStatements(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: 'mock-file.pdf',
        success: { messageText: 'mock-file.pdf deleted' },
      });
    });
  });
});

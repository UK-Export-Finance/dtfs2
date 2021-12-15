import {
  getSupportingDocuments, postSupportingDocuments, uploadSupportingDocument, deleteSupportingDocument, nextDocument,
} from '.';
import Application from '../../../models/application';
import validateFile from '../../../utils/validateFile';
import { uploadAndSaveToDeal, removeFileFromDeal } from '../../../utils/fileUtils';

jest.mock('../../../models/application');
jest.mock('../../../utils/validateFile', () => jest.fn(() => [true, null]));
jest.mock('../../../utils/fileUtils');

const MockResponse = () => {
  const res = {
    redirect: jest.fn(),
    sendStatus: jest.fn(),
    status: jest.fn(() => res),
    render: jest.fn(),
    send: jest.fn(),
  };
  return res;
};

const mockNext = jest.fn();

const MockApplication = () => ({
  _id: 'mock-id',
  supportingInformation: {},
});

describe('controllers/supporting-documents', () => {
  const mockResponse = MockResponse();
  let mockRequest;
  Application.findById.mockResolvedValue(MockApplication());

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSupportingDocuments', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
          documentType: 'manual-inclusion-questionnaire',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
      };
    });

    it('passes error to next() if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await getSupportingDocuments(mockRequest, mockResponse, mockNext);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('renders the manual inclusion questionnaire page as expected', async () => {
      Application.findById.mockResolvedValueOnce({
        supportingInformation: {
          manualInclusion: [{
            _id: 'mockFileId',
            filename: 'mock-file.pdf',
          }],
        },
      });

      await getSupportingDocuments(mockRequest, mockResponse, mockNext);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', {
        formHeaderFragment: 'manualInclusion',
        title: 'Add manual inclusion questionnaire',
        user: {
          roles: [
            'MAKER',
          ],
        },
        dealId: 'mock-id',
        files: [{
          _id: 'mockFileId',
          filename: 'mock-file.pdf',
        }],
      });
    });
  });

  describe('postSupportingDocuments', () => {
    beforeEach(() => {
      mockRequest = {
        body: {},
        params: {
          dealId: 'mock-id',
          documentType: 'manual-inclusion-questionnaire',
        },
        session: {
          user: { roles: ['MAKER'] },
        },
      };
    });

    it('passes error to next() if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await postSupportingDocuments(mockRequest, mockResponse, mockNext);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
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

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.objectContaining({
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
          dealId: 'mock-id',
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

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.objectContaining({
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
          dealId: 'mock-id',
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
            manualInclusion: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        removeFileFromDeal.mockRejectedValueOnce(new Error('mock thrown error'));

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          dealId: 'mock-id',
        }));
      });

      it('deletes a file from application if ID passed', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            manualInclusion: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        removeFileFromDeal.mockResolvedValueOnce();

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.not.objectContaining({
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
        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          dealId: 'mock-id',
        }));
      });

      it('returns error if there are more than 20 files', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            manualInclusion: new Array(21).fill({}).map((_, i) => ({
              _id: `mockFileId${i}`,
              filename: `mock-file-${i}.pdf`,
            })),
          },
        });

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.redirect).not.toHaveBeenCalled();
        expect(mockResponse.render).toHaveBeenCalledWith('partials/upload-supporting-documents.njk', expect.objectContaining({
          errors: expect.objectContaining({
            errorSummary: expect.arrayContaining([
              { href: '#documents', text: expect.any(String) },
            ]),
          }),
          dealId: 'mock-id',
        }));
      });

      it('redirects to application details if there is between 1 and 20 files', async () => {
        Application.findById.mockResolvedValueOnce({
          supportingInformation: {
            manualInclusion: [{
              _id: 'mockFileId',
              filename: 'mock-file.pdf',
            }],
          },
        });

        await postSupportingDocuments(mockRequest, mockResponse, mockNext);

        expect(mockResponse.render).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/mock-id');
      });
    });
  });

  describe('uploadSupportingDocument', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
          documentType: 'manual-inclusion-questionnaire',
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

      await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
      expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
    });

    it('does not upload file if it is invalid', async () => {
      validateFile.mockReturnValueOnce([false, 'mock file error']);

      await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

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

    it('passes error to next() if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(uploadAndSaveToDeal).not.toHaveBeenCalled();
    });

    it('returns any upload errors', async () => {
      uploadAndSaveToDeal.mockResolvedValueOnce([{
        filename: 'mock-file.pdf',
        originalname: 'mock-file.pdf',
        error: 'mock upload error',
      }]);

      await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

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

    // it('returns error if error thrown when uploading', async () => {
    //   uploadAndSaveToDeal.mockRejectedValueOnce('mock thrown error');

    //   await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

    //   expect(mockResponse.status).toHaveBeenCalledWith(200);
    //   expect(mockResponse.send).toHaveBeenCalledWith({
    //     file: {
    //       filename: 'mock-file.pdf',
    //       originalname: 'mock-file.pdf',
    //       error: 'mock-file.pdf could not be uploaded',
    //     },
    //     error: { message: 'mock-file.pdf could not be uploaded' },
    //   });
    // });

    it('returns file with success message if everything valid', async () => {
      uploadAndSaveToDeal.mockResolvedValueOnce([{
        _id: 'mock-file-id',
        filename: 'mock-file.pdf',
        originalname: 'mock-file.pdf',
      }]);

      await uploadSupportingDocument(mockRequest, mockResponse, mockNext);

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

  describe('deleteSupportingDocument', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
          documentType: 'manual-inclusion-questionnaire',
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

      await deleteSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
      expect(removeFileFromDeal).not.toHaveBeenCalled();
    });

    it('passes error to next() if user cannot access application', async () => {
      Application.findById.mockResolvedValueOnce();

      await deleteSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(removeFileFromDeal).not.toHaveBeenCalled();
    });

    it('returns error if error thrown when deleting', async () => {
      removeFileFromDeal.mockRejectedValueOnce('mock thrown error');

      await deleteSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('removes file with success message if everything valid', async () => {
      removeFileFromDeal.mockResolvedValueOnce();

      await deleteSupportingDocument(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        file: 'mock-file.pdf',
        success: { messageText: 'mock-file.pdf deleted' },
      });
    });
  });

  describe('next supporting document', () => {
    const application = {
      supportingInformation: {
        requiredFields: ['manualInclusion', 'managementAccounts', 'financialStatements', 'financialForecasts', 'financialCommentary', 'corporateStructure', 'debtorAndCreditorReports', 'exportLicence'],
      },
    };
    const dealId = 1234;

    it('moves to the financial statements page', () => {
      expect(nextDocument(application, dealId, 'managementAccounts')).toContain('/financial-statements');
    });
    it('moves to the financial forecasts page', () => {
      expect(nextDocument(application, dealId, 'financialStatements')).toContain('/financial-forecasts');
    });
    it('moves to the Brief commentary on the financial information page', () => {
      expect(nextDocument(application, dealId, 'financialForecasts')).toContain('/financial-commentary');
    });
    it('moves to the Corporate structure diagram page', () => {
      expect(nextDocument(application, dealId, 'financialCommentary')).toContain('/corporate-structure');
    });
    it('moves to the Aged debtor and aged creditor listing page', () => {
      expect(nextDocument(application, dealId, 'corporateStructure')).toContain('/debtor-creditor-reports');
    });
    it('moves to the Exporter licence page', () => {
      expect(nextDocument(application, dealId, 'debtorAndCreditorReports')).toContain('/export-licence');
    });
    it('moves to the main application page when user reaches the final step', () => {
      expect(nextDocument(application, dealId, 'exportLicence')).toBe(`/gef/application-details/${dealId}`);
    });

    it('skips the management accounts page and moves to the financial forecasts page', () => {
      application.supportingInformation.requiredFields = ['manualInclusion', 'financialStatements', 'financialForecasts'];
      expect(nextDocument(application, dealId, 'financialStatements')).toContain('/financial-forecasts');
    });
    it('returns to the main applications page', () => {
      application.supportingInformation = {};
      expect(nextDocument(application, dealId, 'manualInclusion')).toBe(`/gef/application-details/${dealId}`);
    });
  });
});

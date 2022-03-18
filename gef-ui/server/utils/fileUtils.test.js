import { uploadAndSaveToDeal, removeFileFromDeal } from './fileUtils';
import {
  uploadFile, deleteFile, updateApplication, updateSupportingInformation,
} from '../services/api';
import Application from '../models/application';

jest.mock('../services/api', () => ({
  uploadFile: jest.fn(),
  deleteFile: jest.fn(),
  updateApplication: jest.fn(),
  updateSupportingInformation: jest.fn(),
}));
jest.mock('../models/application');

const mockFileSize = 12;
const mockToken = 'mock-token';
const mockDocumentPath = 'mock-document-path';
const mockField = 'mockField';
const mockFile = {
  filename: 'mock-file.pdf',
};

const mockUser = { roles: ['MAKER'], _id: '12345' };
const mockDealId = 'mock-id';

let mockDeal = {
  _id: mockDealId,
  supportingInformation: {},
};

describe('utils/fileUtils', () => {
  beforeEach(() => {
    Application.findById.mockResolvedValue(mockDeal);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadAndSaveToDeal', () => {
    it('returns file with error if only problem files uploaded', async () => {
      uploadFile.mockResolvedValueOnce([{ ...mockFile, error: 'mock-error' }]);

      const response = await (uploadAndSaveToDeal([mockFile], mockField, mockDealId, mockToken, mockUser, mockDocumentPath));

      expect(updateApplication).not.toHaveBeenCalled();
      expect(response).toEqual([{ ...mockFile, error: 'mock-error' }]);
    });

    it('adds files to the deal if upload successful', async () => {
      uploadFile.mockResolvedValueOnce([{ ...mockFile, _id: 'mock-file-id' }]);

      const response = await (uploadAndSaveToDeal([mockFile], mockField, mockDealId, mockToken, mockUser, mockFileSize, mockDocumentPath));

      expect(updateSupportingInformation).toHaveBeenCalledWith('mock-id', { ...mockFile, _id: 'mock-file-id' }, mockField, mockUser);
      expect(response).toEqual([{ ...mockFile, _id: 'mock-file-id' }]);
    });
  });

  describe('removeFileFromDeal', () => {
    beforeEach(() => {
      mockDeal = {
        _id: 'mock-id',
        supportingInformation: {
          mockField: [{ ...mockFile, _id: 'mock-file-id' }],
        },
      };
    });

    it('does not try to delete file or update application if filename not found', async () => {
      await removeFileFromDeal('another-file.pdf', mockField, mockDeal, mockToken, mockDocumentPath);

      expect(deleteFile).not.toHaveBeenCalled();
      expect(updateApplication).not.toHaveBeenCalled();
    });

    it('does not try to delete file or update application if file has no ID', async () => {
      mockDeal.supportingInformation.mockField.push({ filename: 'another-file.pdf' });

      await removeFileFromDeal('another-file.pdf', mockField, mockDeal, mockToken, mockDocumentPath);

      expect(deleteFile).not.toHaveBeenCalled();
      expect(updateApplication).not.toHaveBeenCalled();
    });

    it('deletes the file and removes it from application if it has been uploaded (has an ID)', async () => {
      await removeFileFromDeal(mockFile.filename, mockField, mockDeal, mockToken, mockUser);

      expect(deleteFile).toHaveBeenCalledWith('mock-file-id', mockToken, mockField);
      expect(updateApplication).toHaveBeenCalledWith(mockDeal._id, {
        ...mockDeal,
        supportingInformation: {
          mockField: [],
        },
        editorId: mockUser._id,
      });
    });
  });
});

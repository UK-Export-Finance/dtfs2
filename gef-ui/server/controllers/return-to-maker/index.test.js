import {
  getReturnToMaker,
  postReturnToMaker,
  MAX_COMMENT_LENGTH,
} from './index';
import {
  getApplication, updateApplication, setApplicationStatus, getUserDetails,
} from '../../services/api';
import { PROGRESS } from '../../../constants';

jest.mock('../../services/api', () => ({
  __esModule: true,
  getApplication: jest.fn(),
  getUserDetails: jest.fn(),
  setApplicationStatus: jest.fn(),
  updateApplication: jest.fn(),
}));

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

describe('controllers/return-to-maker', () => {
  const mockResponse = new MockResponse();
  let mockRequest;

  beforeEach(() => {
    getApplication.mockResolvedValue({
      _id: '1234',
      status: PROGRESS.BANK_CHECK,
      exporterId: '123',
      coverTermsId: '123',
      bankInternalRefName: 'My test',
    });

    getUserDetails.mockResolvedValue({
      username: 'checker',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReturnToMaker', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          applicationId: 'mock-id',
        },
        query: {},
      };
    });

    it('renders submission page as expected', async () => {
      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/return-to-maker.njk', expect.objectContaining({
        applicationId: 'mock-id',
        maxCommentLength: MAX_COMMENT_LENGTH,
      }));
    });

    it('redirects to dashboard if application is not in correct status', async () => {
      getApplication.mockResolvedValue({ status: PROGRESS.DRAFT });

      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard/gef/');
    });
  });

  describe('postReturnToMaker', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          applicationId: '1234',
        },
        query: {},
        body: {
          comment: 'Some comments here',
        },
        session: {
          userToken: '',
        },
      };
    });

    it('redirects to dashboard if successfully submitted', async () => {
      await postReturnToMaker(mockRequest, mockResponse);

      expect(updateApplication).toHaveBeenCalledWith('1234', expect.objectContaining({
        _id: '1234',
        exporterId: '123',
        coverTermsId: '123',
        bankInternalRefName: 'My test',
        comments: [
          {
            comment: 'Some comments here',
            createdAt: expect.any(Number),
            role: 'checker',
            userName: 'checker',
          },
        ],
      }));
      expect(setApplicationStatus).toHaveBeenCalledWith('1234', PROGRESS.CHANGES_REQUIRED);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard/gef/');
    });

    it('renders error where comments are too long', async () => {
      const longComment = new Array(MAX_COMMENT_LENGTH + 2).join('a');
      mockRequest.body.comment = longComment;

      await postReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/return-to-maker.njk', expect.objectContaining({
        applicationId: '1234',
        comment: longComment,
        maxCommentLength: MAX_COMMENT_LENGTH,
        errors: expect.any(Object),
      }));
    });

    it('calls next if there is an api error', async () => {
      const next = jest.fn();
      updateApplication.mockRejectedValue('mock-error');

      await postReturnToMaker(mockRequest, mockResponse, next);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith('mock-error');
    });
  });
});

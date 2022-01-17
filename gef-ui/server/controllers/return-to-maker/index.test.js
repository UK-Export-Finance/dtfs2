import {
  getReturnToMaker,
  postReturnToMaker,
  MAX_COMMENT_LENGTH,
} from './index';
import {
  getApplication, updateApplication, setApplicationStatus, getUserDetails,
} from '../../services/api';
import { DEAL_STATUS } from '../../constants';

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
  let mockResponse;
  let mockRequest;

  beforeEach(() => {
    mockResponse = MockResponse();

    getApplication.mockResolvedValue({
      _id: '1234',
      status: DEAL_STATUS.READY_FOR_APPROVAL,
      exporter: {},
      bankInternalRefName: 'My test',
    });

    getUserDetails.mockResolvedValue({
      username: 'checker',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getReturnToMaker', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: 'mock-id',
        },
        query: {},
        session: {
          user: { roles: ['CHECKER'] },
        },
      };
    });

    it('renders submission page as expected', async () => {
      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/return-to-maker.njk', expect.objectContaining({
        dealId: 'mock-id',
        maxCommentLength: MAX_COMMENT_LENGTH,
      }));
    });

    it('redirects to dashboard if application is not in correct status', async () => {
      getApplication.mockResolvedValue({ status: DEAL_STATUS.DRAFT });

      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('postReturnToMaker', () => {
    beforeEach(() => {
      mockRequest = {
        params: {
          dealId: '1234',
        },
        query: {},
        body: {
          comment: 'Some comments here',
        },
        session: {
          user: { _id: '007' },
          userToken: '',
        },
      };
    });

    it('redirects to dashboard if successfully submitted', async () => {
      await postReturnToMaker(mockRequest, mockResponse);

      expect(updateApplication).toHaveBeenCalledWith('1234', expect.objectContaining({
        _id: '1234',
        exporter: {},
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
      expect(setApplicationStatus).toHaveBeenCalledWith('1234', DEAL_STATUS.CHANGES_REQUIRED);
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('renders error where comments are too long', async () => {
      const longComment = new Array(MAX_COMMENT_LENGTH + 2).join('a');
      mockRequest.body.comment = longComment;

      await postReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith('partials/return-to-maker.njk', expect.objectContaining({
        dealId: '1234',
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

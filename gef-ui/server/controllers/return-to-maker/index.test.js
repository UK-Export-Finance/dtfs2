import { RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { getReturnToMaker, postReturnToMaker } from './index';
import { getApplication, updateApplication, setApplicationStatus, getUserDetails } from '../../services/api';
import { DEAL_STATUS } from '../../constants';
import { CHECKER } from '../../constants/roles';

const MAX_COMMENT_LENGTH = RETURN_TO_MAKER_COMMENT_CHARACTER_COUNT;

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
      firstname: 'Bob',
      surname: 'Smith',
      email: 'test@test.com',
      roles: 'Checker,',
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
          user: { roles: [CHECKER] },
        },
      };
    });

    it('renders submission page as expected', async () => {
      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/return-to-maker.njk',
        expect.objectContaining({
          dealId: 'mock-id',
          maxCommentLength: MAX_COMMENT_LENGTH,
        }),
      );
    });

    it('redirects to dashboard if application is not in correct status', async () => {
      getApplication.mockResolvedValue({ status: DEAL_STATUS.DRAFT });

      await getReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.render).not.toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('postReturnToMaker', () => {
    const userToken = 'test-token';

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
          userToken,
        },
      };
    });

    it('redirects to dashboard if successfully submitted', async () => {
      await postReturnToMaker(mockRequest, mockResponse);

      expect(updateApplication).toHaveBeenCalledWith({
        dealId: '1234',
        application: expect.objectContaining({
          _id: '1234',
          exporter: {},
          bankInternalRefName: 'My test',
          comments: [
            {
              comment: 'Some comments here',
              createdAt: expect.any(Number),
              userName: 'checker',
              firstname: 'Bob',
              surname: 'Smith',
              email: 'test@test.com',
              roles: 'Checker,',
            },
          ],
        }),
        userToken,
      });
      expect(setApplicationStatus).toHaveBeenCalledWith({
        dealId: '1234',
        status: DEAL_STATUS.CHANGES_REQUIRED,
        userToken,
      });
      expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');
    });

    it('renders error where comments are too long', async () => {
      const longComment = new Array(MAX_COMMENT_LENGTH + 2).join('a');
      mockRequest.body.comment = longComment;

      await postReturnToMaker(mockRequest, mockResponse);

      expect(mockResponse.redirect).not.toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith(
        'partials/return-to-maker.njk',
        expect.objectContaining({
          dealId: '1234',
          comment: longComment,
          maxCommentLength: MAX_COMMENT_LENGTH,
          errors: expect.any(Object),
        }),
      );
    });

    describe('Line ending normalization tests', () => {
      it('should accept comment exactly at 400 characters with Windows line endings', async () => {
        const commentText = 'a'.repeat(MAX_COMMENT_LENGTH - 1);
        const commentWithWindowsLineEnding = `${commentText}\r\n`;
        mockRequest.body.comment = commentWithWindowsLineEnding;

        // Verify original length with Windows line ending is 401 characters
        expect(commentWithWindowsLineEnding.length).toBe(MAX_COMMENT_LENGTH + 1);

        await postReturnToMaker(mockRequest, mockResponse);

        // Verify that the controller accepted the comment (no validation error)
        expect(mockResponse.render).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');

        // Extract the actual normalized comment from the mock call
        const updateCall = updateApplication.mock.calls[0][0];
        const actualNormalizedComment = updateCall.application.comments[0].comment;

        expect(actualNormalizedComment.length).toBe(MAX_COMMENT_LENGTH);

        expect(actualNormalizedComment).not.toContain('\r');
        expect(actualNormalizedComment.endsWith('\n')).toBe(true);
      });

      it('should normalize Windows line endings and count as one character', async () => {
        const commentWithWindowsLineEndings = 'Line 1\r\nLine 2\r\nLine 3';
        mockRequest.body.comment = commentWithWindowsLineEndings;

        expect(commentWithWindowsLineEndings.length).toBe(22);

        await postReturnToMaker(mockRequest, mockResponse);

        // Verify no validation error occurred
        expect(mockResponse.render).not.toHaveBeenCalled();
        expect(mockResponse.redirect).toHaveBeenCalledWith('/dashboard');

        // Extract the actual normalized comment from the mock call
        const updateCall = updateApplication.mock.calls[0][0];
        const actualNormalizedComment = updateCall.application.comments[0].comment;

        expect(actualNormalizedComment.length).toBe(20);

        expect(actualNormalizedComment).not.toContain('\r');
        expect(actualNormalizedComment).toContain('\n');

        // Verify the content is preserved (just line endings changed)
        expect(actualNormalizedComment).toBe('Line 1\nLine 2\nLine 3');
      });
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

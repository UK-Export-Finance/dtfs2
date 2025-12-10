import { MAKER_SUBMIT_COMMENT_CHARACTER_COUNT } from '@ukef/dtfs2-common';
import { getApplicationSubmission, postApplicationSubmission } from './index';
import api from '../../services/api';
import { DEAL_STATUS } from '../../constants';
import MOCKS from '../mocks/index';
import { MAKER } from '../../constants/roles';

const MAX_COMMENT_LENGTH = MAKER_SUBMIT_COMMENT_CHARACTER_COUNT;

jest.mock('../../services/api');

describe('controllers/application-submission', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponse();
    mockRequest = MOCKS.MockRequest();
    mockApplicationResponse = MOCKS.MockApplicationResponseSubmission();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getFacilities.mockResolvedValue(MOCKS.MockFacilityResponse());
    api.updateApplication.mockResolvedValue({});
    api.setApplicationStatus.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET Application Submission', () => {
    it('renders submission page as expected', async () => {
      await getApplicationSubmission(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith(
        'application-details-comments.njk',
        expect.objectContaining({
          dealId: expect.any(String),
          submissionType: expect.any(String),
          maxCommentLength: expect.any(Number),
          hasIssuedFacility: expect.any(Boolean),
        }),
      );
    });
  });

  describe('POST Application Submission', () => {
    const userToken = 'test-token';
    beforeEach(() => {
      mockRequest = MOCKS.MockSubmissionRequest();
      mockRequest.session.userToken = userToken;
    });

    it('renders confirmation if successfully submitted', async () => {
      await postApplicationSubmission(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith(
        'application-details-submitted.njk',
        expect.objectContaining({
          dealId: expect.any(String),
          status: expect.any(String),
          submissionType: expect.any(String),
          hasIssuedFacility: expect.any(Boolean),
        }),
      );
    });

    it('renders error where comments are too long', async () => {
      const longComments = 'a'.repeat(410);
      mockRequest.body.comment = longComments;

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        'application-details-comments.njk',
        expect.objectContaining({
          dealId: expect.any(String),
          comment: longComments,
          maxCommentLength: expect.any(Number),
          errors: expect.any(Object),
        }),
      );
    });

    it('adds a comment to the application when the user enters one', async () => {
      mockRequest.body.comment = 'Some comments here';
      api.updateApplication = jest.fn();

      const expected = {
        ...{
          comments: [
            {
              roles: [MAKER],
              userName: 'maker',
              firstname: 'Bob',
              surname: 'Smith',
              email: 'test@test.com',
              createdAt: expect.any(Number),
              comment: mockRequest.body.comment,
            },
          ],
          editorId: 1235,
        },
      };

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.updateApplication).toHaveBeenCalledWith({
        dealId: mockApplicationResponse._id,
        application: expected,
        userToken,
      });
    });

    it('does not add a comment to the application when the user does not enter one', async () => {
      api.updateApplication = jest.fn();
      mockRequest.body.comment = '';

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.updateApplication).toHaveReturnedWith(undefined);
    });

    it('updates the application status to `READY_FOR_APPROVAL`', async () => {
      api.setApplicationStatus = jest.fn();
      mockRequest.body.comment = '';

      await postApplicationSubmission(mockRequest, mockResponse);

      expect(api.setApplicationStatus).toHaveBeenCalledWith({
        dealId: mockApplicationResponse._id,
        status: DEAL_STATUS.READY_FOR_APPROVAL,
        userToken,
      });
    });

    describe('Line ending normalization tests', () => {
      it('should accept comment exactly at 400 characters with Windows line endings', async () => {
        const commentText = 'a'.repeat(MAX_COMMENT_LENGTH - 1);
        const commentWithWindowsLineEnding = `${commentText}\r\n`;
        mockRequest.body.comment = commentWithWindowsLineEnding;

        // Verify original length with Windows line ending is 401 characters
        expect(commentWithWindowsLineEnding.length).toBe(MAX_COMMENT_LENGTH + 1);

        await postApplicationSubmission(mockRequest, mockResponse);

        // Verify that the controller accepted the comment (no validation error)
        expect(mockResponse.render).toHaveBeenCalledWith(
          'application-details-submitted.njk',
          expect.objectContaining({
            dealId: expect.any(String),
            status: expect.any(String),
          }),
        );

        // Extract the actual normalized comment from the mock call
        const updateCall = api.updateApplication.mock.calls[0][0];
        const actualNormalizedComment = updateCall.application.comments[0].comment;

        expect(actualNormalizedComment.length).toBe(MAX_COMMENT_LENGTH);

        expect(actualNormalizedComment).not.toContain('\r');
        expect(actualNormalizedComment.endsWith('\n')).toBe(true);
      });

      it('should normalize Windows line endings and count as one character', async () => {
        const commentWithWindowsLineEndings = 'Line 1\r\nLine 2\r\nLine 3';
        mockRequest.body.comment = commentWithWindowsLineEndings;

        expect(commentWithWindowsLineEndings.length).toBe(22);

        await postApplicationSubmission(mockRequest, mockResponse);

        // Extract the actual normalized comment from the mock call
        const updateCall = api.updateApplication.mock.calls[0][0];
        const actualNormalizedComment = updateCall.application.comments[0].comment;

        expect(actualNormalizedComment.length).toBe(20);

        expect(actualNormalizedComment).not.toContain('\r');
        expect(actualNormalizedComment).toContain('\n');

        // Verify the content is preserved (just line endings changed)
        expect(actualNormalizedComment).toBe('Line 1\nLine 2\nLine 3');
      });
    });
  });
});

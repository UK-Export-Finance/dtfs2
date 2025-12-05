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

        // After normalization, \r\n becomes \n, so length becomes exactly 400 characters
        const normalizedComment = `${commentText}\n`;
        expect(normalizedComment.length).toBe(MAX_COMMENT_LENGTH);

        await postApplicationSubmission(mockRequest, mockResponse);

        expect(mockResponse.render).toHaveBeenCalledWith(
          'application-details-submitted.njk',
          expect.objectContaining({
            dealId: expect.any(String),
            status: expect.any(String),
          }),
        );
      });

      it('should normalize Windows line endings and count as one character', async () => {
        const commentWithWindowsLineEndings = 'Line 1\r\nLine 2\r\nLine 3';
        mockRequest.body.comment = commentWithWindowsLineEndings;

        // Verify original length is 22 characters
        expect(commentWithWindowsLineEndings.length).toBe(22);

        await postApplicationSubmission(mockRequest, mockResponse);

        // Verifying that \r\n was converted to \n (2 chars became 1 char each)
        const normalizedComment = 'Line 1\nLine 2\nLine 3';

        // Verify normalized length is 20 characters (2 characters less)
        expect(normalizedComment.length).toBe(20);

        // Verify that api.updateApplication was called with normalized comment
        expect(api.updateApplication).toHaveBeenCalledWith({
          dealId: mockApplicationResponse._id,
          application: expect.objectContaining({
            comments: [
              expect.objectContaining({
                comment: normalizedComment,
              }),
            ],
          }),
          userToken,
        });
      });
    });
  });
});

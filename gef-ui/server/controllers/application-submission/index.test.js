import { getApplicationSubmission, postApplicationSubmission } from './index';
import api from '../../services/api';
import { DEAL_STATUS } from '../../constants';
import MOCKS from '../mocks/index';
import { MAKER } from '../../constants/roles';

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
  });
});

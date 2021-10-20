import { submitToUkef, createSubmissionToUkef } from './index';
import api from '../../services/api';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.body = { comment: '' };
  req.query = {};
  req.session = { user: { _id: '007' }, userToken: 'dummy-token' };
  req.params.applicationId = '123';
  return req;
};

const MockApplicationResponse = () => {
  const res = {};
  res.exporterId = '123';
  res.bankInternalRefName = 'My test';
  res.comments = [{
    role: 'maker',
    userName: 'Test User',
    createdAt: '1625482095783',
    comment: 'The client needs this asap.',
  }];
  return res;
};

const MockMakerUserResponse = () => ({
  firstName: 'first',
  surname: 'surname',
  timezone: 'Europe/London',
});

describe('controllers/submit-to-ukef', () => {
  let mockResponse;
  let mockRequest;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    const mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.getUserDetails.mockResolvedValue(MockMakerUserResponse());
    api.updateApplication.mockResolvedValue(mockApplicationResponse);
    api.setApplicationStatus.mockResolvedValue(mockApplicationResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('create submission to UKEF', () => {
    it('redirects to submission url', async () => {
      await createSubmissionToUkef(mockRequest, mockResponse);
      // TODO: DTFS2-4706 - add a route and redirect instead of rendering?
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef-confirmation.njk');
    });

    it('renders an error when the comment is over the maximum length', async () => {
      const longComments = 'a'.repeat(401);
      mockRequest.body.comment = longComments;

      await createSubmissionToUkef(mockRequest, mockResponse);

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef.njk', expect.objectContaining({
          applicationId: expect.any(String),
          comment: longComments,
          maxCommentLength: expect.any(Number),
          errors: expect.any(Object),
        }));
    });
  });

  describe('Submit to UKEF', () => {
    it('renders the page as expected', async () => {
      await submitToUkef(mockRequest, mockResponse);

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/submit-to-ukef.njk',
          expect.objectContaining({
            applicationId: expect.any(String),
            maxCommentLength: expect.any(Number),
          }));
    });
  });
});

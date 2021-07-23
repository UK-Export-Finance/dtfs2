import { automaticCover, validateAutomaticCover } from './index';
import * as api from '../../services/api';
import { DEAL_SUBMISSION_TYPE } from '../../../constants';

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.applicationId = '123';
  req.body = {};
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockCoverResponse = () => {
  const res = {};
  res.terms = [];
  return res;
};

const MockCoverTermsResponse = () => {
  const res = {};
  return res;
};

const mockUpdateApplication = jest.fn(() => Promise.resolve());

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET Automatic Cover', () => {
  it('renders the `automatic-cover` template', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockEligibilityCriteriaResponse = new MockCoverResponse();
    const mockCoverTermsResponse = new MockCoverTermsResponse();

    mockEligibilityCriteriaResponse.terms.push({
      id: 'coverStart',
      htmlText: '&lt;p&gt;x. this one shouldn&#39;t show as it&#39;s an old version&lt;/p&gt',
      errMsg: 'Error message',
    });

    api.getApplication = () => Promise.resolve(mockRequest);
    api.getEligibilityCriteria = () => Promise.resolve(mockEligibilityCriteriaResponse);
    api.getCoverTerms = () => Promise.resolve(mockCoverTermsResponse);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/automatic-cover.njk', {
        terms: [{
          errMsg: 'Error message',
          htmlText: '<p>x. this one shouldn\'t show as it\'s an old version</p>',
          id: 'coverStart',
        }],
        applicationId: '123',
      });
  });

  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockedRejection = { response: { status: 400, message: 'Whoops' } };

    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await automaticCover(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate Automatic Cover', () => {
  describe('when `save and return` is set to true', () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockCoverResponse = new MockCoverResponse();
    const mockApplicationId = '123';

    beforeEach(async () => {
      mockRequest.query.saveAndReturn = 'true';
      mockRequest.body = { coverStart: 'true', value: 'true' };

      api.getApplication = () => Promise.resolve(mockRequest);
      api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
      api.updateCoverTerms = () => Promise.resolve();
      api.updateApplication = mockUpdateApplication;
      await validateAutomaticCover(mockRequest, mockResponse);
    });

    it('returns no validation errors', async () => {
      expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${mockApplicationId}`);
    });

    it('calls api.updateApplication with AIN submissionType', () => {
      const expected = {
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
      };

      expect(mockUpdateApplication).toHaveBeenCalledWith(mockApplicationId, expected);
    });
  });

  it('renders the correct data if validation fails', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();

    mockCoverResponse.terms.push({
      id: 'coverStart',
      htmlText: 'Some text',
      errMsg: 'Error message for some text',
    });
    api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
    await validateAutomaticCover(mockRequest, mockResponse);
    expect(mockResponse.render)
      .toHaveBeenCalledWith('partials/automatic-cover.njk', expect.objectContaining({
        errors: expect.any(Object),
        terms: mockCoverResponse.terms,
        selected: {},
        applicationId: '123',
      }));
  });

  describe('when user selects at least 1 false', () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();
    const mockApplicationId = '123';

    beforeEach(async () => {
      api.updateApplication = mockUpdateApplication;

      mockRequest.body = { coverStart: 'false' };
      api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
      await validateAutomaticCover(mockRequest, mockResponse);
    });

    it('redirects user to `ineligible-automatic-cover` page', async () => {
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `/gef/application-details/${mockApplicationId}/ineligible-automatic-cover`,
      );

      mockRequest.body = { coverStart: 'false', value: 'true' };
      api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
      await validateAutomaticCover(mockRequest, mockResponse);
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `/gef/application-details/${mockApplicationId}/ineligible-automatic-cover`,
      );
    });

    it('calls api.updateApplication with MIA submissionType', () => {
      const expected = {
        submissionType: DEAL_SUBMISSION_TYPE.MIA,
      };

      expect(mockUpdateApplication).toHaveBeenCalledWith(mockApplicationId, expected);
    });
  });

  describe('user selects all true values', () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const mockCoverResponse = new MockCoverResponse();
    const mockApplicationId = '123';

    beforeEach(async () => {
      mockRequest.body = { coverStart: 'true', value: 'true' };
      api.getEligibilityCriteria = () => Promise.resolve(mockCoverResponse);
      await validateAutomaticCover(mockRequest, mockResponse);
    });

    it('redirects user to `application details` page', async () => {
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        `/gef/application-details/${mockApplicationId}/eligible-automatic-cover`,
      );
    });

    it('calls api.updateApplication with AIN submissionType', () => {
      const expected = {
        submissionType: DEAL_SUBMISSION_TYPE.AIN,
      };

      expect(mockUpdateApplication).toHaveBeenCalledWith(mockApplicationId, expected);
    });
  });


  it('redirects user to `problem with service` page if there is an issue with the api', async () => {
    const mockRequest = new MockRequest();
    const mockResponse = new MockResponse();
    const next = jest.fn();

    const mockedRejection = { status: 400, message: 'Whoops' };

    api.getEligibilityCriteria = () => Promise.reject(mockedRejection);
    await validateAutomaticCover(mockRequest, mockResponse, next);
    expect(next).toHaveBeenCalledWith(mockedRejection);
  });
});

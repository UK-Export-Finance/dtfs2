import { decode } from 'html-entities';
import { automaticCover, validateAutomaticCover } from './index';
import api from '../../services/api';
import { DEAL_SUBMISSION_TYPE } from '../../../constants';

jest.mock('../../services/api');

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
  res.terms = [{
    id: 'coverStart',
    htmlText: '&lt;p&gt;x. this one shouldn&#39;t show as it&#39;s an old version&lt;/p&gt',
    errMsg: 'Error message',
  }, {
    id: 'value',
    htmlText: '&lt;p&gt;x. this one shouldn&#39;t show as it&#39;s an old version&lt;/p&gt',
    errMsg: 'Error message',
  }];
  return res;
};

const mockUpdateApplication = jest.fn(() => Promise.resolve());

describe('controllers/automatic-cover', () => {
  let mockResponse;
  let mockRequest;
  let mockCoverResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockCoverResponse = MockCoverResponse();

    api.getApplication.mockResolvedValue({});
    api.getEligibilityCriteria.mockResolvedValue(mockCoverResponse);
    api.updateApplication = mockUpdateApplication;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('GET Automatic Cover', () => {
    it('renders the `automatic-cover` template', async () => {
      await automaticCover(mockRequest, mockResponse);
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/automatic-cover.njk', {
          terms: [{
            errMsg: 'Error message',
            htmlText: '<p>x. this one shouldn\'t show as it\'s an old version</p>',
            id: 'coverStart',
          }, {
            errMsg: 'Error message',
            htmlText: '<p>x. this one shouldn\'t show as it\'s an old version</p>',
            id: 'value',
          }],
          applicationId: '123',
        });
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };

      api.getEligibilityCriteria.mockRejectedValueOnce(mockedRejection);
      await automaticCover(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Automatic Cover', () => {
    describe('when `save and return` is set to true', () => {
      const mockApplicationId = '123';

      beforeEach(async () => {
        mockRequest.query.saveAndReturn = 'true';
        mockRequest.body = { coverStart: 'true' };

        await validateAutomaticCover(mockRequest, mockResponse);
      });

      it('returns no validation errors', async () => {
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${mockApplicationId}`);
      });

      it('calls api.updateApplication with undefined submissionType', () => {
        const expected = {
          submissionType: undefined,
        };

        expect(mockUpdateApplication).toHaveBeenCalledWith(mockApplicationId, expected);
      });
    });

    it('renders the correct data if validation fails', async () => {
      await validateAutomaticCover(mockRequest, mockResponse);
      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/automatic-cover.njk', expect.objectContaining({
          errors: expect.any(Object),
          terms: mockCoverResponse.terms.map((term) => ({
            ...term,
            htmlText: decode(term.htmlText),
          })),
          selected: {},
          applicationId: '123',
        }));
    });

    describe('when user selects at least 1 false answer', () => {
      const mockApplicationId = '123';

      beforeEach(async () => {
        mockRequest.body = { coverStart: 'false', value: 'true' };
        await validateAutomaticCover(mockRequest, mockResponse);
      });

      it('redirects user to `ineligible-automatic-cover` page', async () => {
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          `/gef/application-details/${mockApplicationId}/ineligible-automatic-cover`,
        );

        mockRequest.body = { coverStart: 'false', value: 'true' };
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

    describe('when user selects all true values', () => {
      const mockApplicationId = '123';

      beforeEach(async () => {
        mockRequest.body = { coverStart: 'true', value: 'true' };
        api.getEligibilityCriteria.mockResolvedValueOnce(mockCoverResponse);
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
      const next = jest.fn();

      const mockedRejection = { status: 400, message: 'Whoops' };

      api.getEligibilityCriteria.mockRejectedValueOnce(mockedRejection);
      await validateAutomaticCover(mockRequest, mockResponse, next);
      expect(next).toHaveBeenCalledWith(mockedRejection);
    });
  });
});

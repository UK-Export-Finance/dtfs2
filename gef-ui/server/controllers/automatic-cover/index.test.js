import { automaticCover, validateAutomaticCover } from './index';
import api from '../../services/api';
import { DEAL_SUBMISSION_TYPE } from '../../constants';

jest.mock('../../services/api');

const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.params.dealId = '123';
  req.body = {};
  req.session = {
    user: {
      _id: '12345',
    },
  };
  return req;
};

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const MockEligibilityCriteria = () => ({
  criteria: [
    {
      id: 12,
      name: 'coverStart',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 13,
      name: 'noticeDate',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 14,
      name: 'facilityLimit',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 15,
      name: 'exporterDeclaration',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 16,
      name: 'dueDiligence',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 17,
      name: 'facilityLetter',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 18,
      name: 'facilityBaseCurrency',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
    {
      id: 19,
      name: 'facilityPaymentCurrency',
      answer: null,
      text: 'Test',
      errMsg: 'Mock error message',
    },
  ],
});

const MockApplicationResponse = () => {
  const res = {};
  res._id = '1234';
  res.eligibility = MockEligibilityCriteria();

  return res;
};

const mockUpdateApplication = jest.fn(() => Promise.resolve());

describe('controllers/automatic-cover', () => {
  let mockResponse;
  let mockRequest;
  let mockApplicationResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockApplicationResponse = MockApplicationResponse();

    api.getApplication.mockResolvedValue(mockApplicationResponse);
    api.updateApplication = mockUpdateApplication;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('GET Automatic Cover', () => {
    it('renders the `automatic-cover` template', async () => {
      await automaticCover(mockRequest, mockResponse);

      const expectedCriteria = MockEligibilityCriteria().criteria.map((criterion) => ({
        ...criterion,
        text: 'Test',
      }));

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/automatic-cover.njk', {
          criteria: expectedCriteria,
          dealId: '123',
        });
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      const mockedRejection = { response: { status: 400, message: 'Whoops' } };

      api.getApplication.mockRejectedValueOnce(mockedRejection);
      await automaticCover(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Validate Automatic Cover', () => {
    describe('when `save and return` is set to true', () => {
      const mockDealId = '123';

      beforeEach(async () => {
        mockRequest.query.saveAndReturn = 'true';
        mockRequest.body = { 12: 'true' };

        await validateAutomaticCover(mockRequest, mockResponse);
      });

      it('returns no validation errors', async () => {
        expect(mockResponse.redirect).toHaveBeenCalledWith(`/gef/application-details/${mockDealId}`);
      });

      it('calls api.updateApplication with undefined submissionType', () => {
        const expected = {
          submissionType: undefined,
        };

        expect(mockUpdateApplication).toHaveBeenCalledWith(mockDealId, expected);
      });
    });

    it('renders the correct data if validation fails', async () => {
      await validateAutomaticCover(mockRequest, mockResponse);

      const expectedCriteria = MockEligibilityCriteria().criteria.map((criterion) => ({
        ...criterion,
        text: 'Test',
      }));

      expect(mockResponse.render)
        .toHaveBeenCalledWith('partials/automatic-cover.njk', expect.objectContaining({
          errors: expect.any(Object),
          criteria: expectedCriteria,
          dealId: '123',
        }));
    });

    describe('when user selects at least 1 false answer', () => {
      const mockDealId = '123';

      beforeEach(async () => {
        mockRequest.body = {
          12: 'false',
          13: 'true',
          14: 'true',
          15: 'true',
          16: 'true',
          17: 'true',
          18: 'true',
          19: 'true',
        };
        await validateAutomaticCover(mockRequest, mockResponse);
      });

      it('redirects user to `ineligible-automatic-cover` page', async () => {
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          `/gef/application-details/${mockDealId}/ineligible-automatic-cover`,
        );

        mockRequest.body = { 12: 'false', 13: 'true' };
        await validateAutomaticCover(mockRequest, mockResponse);
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          `/gef/application-details/${mockDealId}/ineligible-automatic-cover`,
        );
      });

      it('calls api.updateApplication with MIA submissionType', () => {
        const expected = {
          submissionType: DEAL_SUBMISSION_TYPE.MIA,
        };

        expect(mockUpdateApplication).toHaveBeenCalledWith(mockDealId, expected);
      });
    });

    describe('when user selects all true values', () => {
      const mockDealId = '123';

      beforeEach(async () => {
        mockRequest.body = {
          12: 'true',
          13: 'true',
          14: 'true',
          15: 'true',
          16: 'true',
          17: 'true',
          18: 'true',
          19: 'true',
        };

        await validateAutomaticCover(mockRequest, mockResponse);
      });

      it('redirects user to `application details` page', async () => {
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          `/gef/application-details/${mockDealId}/eligible-automatic-cover`,
        );
      });

      it('calls api.updateApplication with AIN submissionType', () => {
        const expected = {
          submissionType: DEAL_SUBMISSION_TYPE.AIN,
        };

        expect(mockUpdateApplication).toHaveBeenCalledWith(mockDealId, expected);
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the api', async () => {
      const next = jest.fn();

      const mockedRejection = { status: 400, message: 'Whoops' };

      api.getApplication.mockRejectedValueOnce(mockedRejection);
      await validateAutomaticCover(mockRequest, mockResponse, next);
      expect(next).toHaveBeenCalledWith(mockedRejection);
    });
  });
});

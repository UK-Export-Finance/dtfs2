import { facilities, createFacility } from './index';
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
  req.query = {};
  req.body = {};
  req.params.applicationId = '123';
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {
    _id: 'abc',
    facilityType: 'CASH',
    applicationId: '123',
    hasBeenIssued: true,
  };
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('controllers/facilities', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.createFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue(mockFacilityResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Facilities', () => {
    it('renders the `Facilities` template when there is no facility ID provided', async () => {
      await facilities(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
        facilityType: 'cash',
        applicationId: '123',
        status: undefined,
      }));
    });

    it('renders the `Facilities` template when there is a facility ID', async () => {
      mockRequest.params.facilityId = 'xyz';
      mockRequest.query.status = 'change';

      await facilities(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
        facilityType: 'cash',
        applicationId: '123',
        hasBeenIssued: 'true',
        status: 'change',
      }));
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      mockRequest.params.facilityId = 'xyz';
      api.getFacility.mockRejectedValueOnce();

      await facilities(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });
  });

  describe('Create Facility', () => {
    it('returns Has Been Issued validation error', async () => {
      await createFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/facilities.njk', expect.objectContaining({
        errors: expect.objectContaining({
          errorSummary: expect.arrayContaining([{ href: '#hasBeenIssued', text: expect.any(String) }]),
        }),
        applicationId: '123',
      }));
    });

    it('calls the create facility api if no facility ID has been provided', async () => {
      mockRequest.body.hasBeenIssued = 'true';
      await createFacility(mockRequest, mockResponse);

      expect(api.updateFacility).not.toHaveBeenCalled();
      expect(api.createFacility).toHaveBeenCalledWith({
        applicationId: '123',
        hasBeenIssued: true,
        type: 'CASH',
      });
    });

    it('calls the update facility api if facility ID has been provided', async () => {
      mockRequest.body.hasBeenIssued = 'false';
      mockRequest.params.facilityId = 'xyz';
      await createFacility(mockRequest, mockResponse);

      expect(api.createFacility).not.toHaveBeenCalled();
      expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
        hasBeenIssued: false,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with any of the api', async () => {
      mockRequest.body.hasBeenIssued = 'true';
      api.createFacility.mockRejectedValueOnce({ response: { status: 400, message: 'Whoops' } });

      await createFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
    });

    it('redirects user to `application` page if status query is set to `Change`', async () => {
      mockRequest.query.status = 'change';
      mockRequest.body.hasBeenIssued = 'true';

      await createFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('redirects user to `about facility` page if response from api is successful', async () => {
      mockRequest.body.hasBeenIssued = 'true';

      await createFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123/facilities/abc/about-facility');
    });
  });
});

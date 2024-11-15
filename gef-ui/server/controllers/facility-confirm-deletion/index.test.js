import { facilityConfirmDeletion, deleteFacility } from './index';
import api from '../../services/api';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

const MockResponse = () => {
  const res = {};
  res.redirect = jest.fn();
  res.render = jest.fn();
  return res;
};

const userToken = 'test-token';
const MockRequest = () => {
  const req = {};
  req.params = {};
  req.query = {};
  req.body = {};
  req.session = {
    user: {
      _id: '12345',
    },
    userToken,
  };
  req.params.dealId = '123';
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {};
  return res;
};

afterEach(() => {
  jest.resetAllMocks();
});

describe('controllers/facility-confirm-deletion', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.deleteFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe('GET Facility Confirm Deletion', () => {
    it('renders the `Facility Currency` template', async () => {
      mockFacilityResponse.details.type = CONSTANTS.FACILITY_TYPE.CASH;
      api.getFacility.mockResolvedValueOnce(mockFacilityResponse);

      await facilityConfirmDeletion(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith(
        '_partials/facility-confirm-deletion.njk',
        expect.objectContaining({
          heading: 'Cash',
          dealId: '123',
        }),
      );
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      await facilityConfirmDeletion(mockRequest, mockResponse);
      expect(mockResponse.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });

  describe('Delete Facility', () => {
    it('calls the update api with the correct data', async () => {
      await deleteFacility(mockRequest, mockResponse);

      expect(api.deleteFacility).toHaveBeenCalledWith({ facilityId: 'xyz', userToken });
    });

    it('redirects user to application page if deletion was successful', async () => {
      await deleteFacility(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
    });

    it('calls api.updateApplication with editorId if deletion was successful', async () => {
      await deleteFacility(mockRequest, mockResponse);

      const expectedUpdateObj = {
        editorId: '12345',
      };

      expect(updateApplicationSpy).toHaveBeenCalledWith({
        dealId: mockRequest.params.dealId,
        application: expectedUpdateObj,
        userToken,
      });
    });

    it('redirects user to `problem with service` page if there is an issue with the API', async () => {
      api.deleteFacility.mockRejectedValueOnce();

      await deleteFacility(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });
});

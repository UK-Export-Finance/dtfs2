import { getCurrentGefDealVersion, isFacilityEndDateEnabledOnGefVersion } from '@ukef/dtfs2-common';
import { aboutFacility } from './index';
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
  res.details = {
    type: CONSTANTS.FACILITY_TYPE.CASH,
    name: 'UKEF123',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2030-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    coverEndDate: null,
  };
  return res;
};

describe('aboutFacility', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  const updateApplicationSpy = jest.fn();

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue({ version: getCurrentGefDealVersion() });
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
    api.updateApplication = updateApplicationSpy;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the `About Facility` template', async () => {
    mockRequest.query.status = 'change';

    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith(
      'partials/about-facility.njk',
      expect.objectContaining({
        facilityType: CONSTANTS.FACILITY_TYPE.CASH,
        facilityName: 'UKEF123',
        hasBeenIssued: true,
        monthsOfCover: null,
        shouldCoverStartOnSubmission: 'true',
        coverStartDateDay: '2',
        coverStartDateMonth: '1',
        coverStartDateYear: '2030',
        coverEndDateMonth: null,
        coverEndDateYear: null,
        facilityTypeString: 'cash',
        dealId: '123',
        facilityId: 'xyz',
        status: 'change',
        isFacilityEndDateEnabled: isFacilityEndDateEnabledOnGefVersion(getCurrentGefDealVersion()),
      }),
    );
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

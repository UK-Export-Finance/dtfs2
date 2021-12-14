import {
  renderChangeFacilityPartial,
  changeUnissuedAboutFacility,
  changeUnissuedAboutFacilityChange,
  postChangeUnissuedAboutFacility,
  postChangeUnissuedAboutFacilityChange,
} from './index';
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
  req.params.facilityId = 'xyz';
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {
    type: 'CASH',
    name: 'Foundry4',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2030-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    coverEndDate: null,
  };
  return res;
};

describe('renderChangeFacilityPartial()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders the unissued-change-about-facility template if change === true', async () => {
    mockRequest.query.status = 'change';
    await renderChangeFacilityPartial(mockRequest, mockResponse, true);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
      shouldCoverStartOnSubmission: 'true',
      coverStartDateDay: '2',
      coverStartDateMonth: '1',
      coverStartDateYear: '2030',
      coverEndDateMonth: null,
      coverEndDateYear: null,
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: true,
    }));
  });

  it('does not renders the unissued-change-about-facility template if change is mismatched', async () => {
    mockRequest.query.status = 'change';
    await renderChangeFacilityPartial(mockRequest, mockResponse, true);
    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
      shouldCoverStartOnSubmission: 'true',
      coverStartDateDay: '2',
      coverStartDateMonth: '1',
      coverStartDateYear: '2030',
      coverEndDateMonth: null,
      coverEndDateYear: null,
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: false,
    }));
  });

  it('renders the unissued-change-about-facility template if change === false', async () => {
    mockRequest.query.status = 'change';
    await renderChangeFacilityPartial(mockRequest, mockResponse, false);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
      shouldCoverStartOnSubmission: 'true',
      coverStartDateDay: '2',
      coverStartDateMonth: '1',
      coverStartDateYear: '2030',
      coverEndDateMonth: null,
      coverEndDateYear: null,
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: false,
    }));
  });
});

describe('changeUnissuedAboutFacility()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MockResponse();
    mockRequest = MockRequest();
    mockFacilityResponse = MockFacilityResponse();

    api.getApplication.mockResolvedValue({});
    api.getFacility.mockResolvedValue(mockFacilityResponse);
    api.updateFacility.mockResolvedValue({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it.only('changeUnissuedAboutFacility should call renderChangeFacilityPartial with false', async () => {
    mockRequest.query.status = 'change';
    const result = await changeUnissuedAboutFacility(mockRequest, mockResponse);
    console.log('result', result);
    const expected = await renderChangeFacilityPartial(mockRequest, mockResponse, false);

    expect(result).toEqual(expected);
  });
});

import { aboutFacility, validateAboutFacility } from './index';
import * as api from '../../services/api';

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

const MockAboutFacilityResponse = () => {
  const res = {};
  res.details = {
    type: 'CASH',
    name: 'Foundry4',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2030-01-02T00:00:00.000+00:00',
    hasCoverStartDate: true,
    coverEndDate: null,
  };
  return res;
};

const updateFacilitySpy = jest.spyOn(api, 'updateFacility').mockImplementationOnce(() => Promise.resolve());

afterEach(() => {
  jest.clearAllMocks();
});

describe('GET About Facility', () => {
  it('renders the `About Facility` template', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutFacilityResponse = new MockAboutFacilityResponse();

    mockRequest.query.status = 'change';

    api.getFacility = () => Promise.resolve(mockAboutFacilityResponse);
    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
      facilityType: 'CASH',
      facilityName: 'Foundry4',
      hasBeenIssued: true,
      monthsOfCover: null,
      hasCoverStartDate: 'true',
      coverStartDateDay: '2',
      coverStartDateMonth: '1',
      coverStartDateYear: '2030',
      coverEndDateMonth: null,
      coverEndDateYear: null,
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();

    api.getFacility = () => Promise.reject();
    await aboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('Validate About Facility', () => {
  it('redirects user to application page if application page if save and return is set to true', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    const mockAboutFacilityResponse = new MockAboutFacilityResponse();
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = 'CASH';

    api.updateFacility = () => Promise.resolve(mockAboutFacilityResponse);
    await validateAboutFacility(mockRequest, mockResponse);

    expect(mockResponse.redirect).toHaveBeenCalledWith('/gef/application-details/123');
  });

  it('sets the correct date format using single day, month and year values', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.facilityType = 'CASH';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = '3';
    mockRequest.body['cover-start-date-month'] = '12';
    mockRequest.body['cover-start-date-year'] = '2022';

    mockRequest.body['cover-end-date-day'] = '01';
    mockRequest.body['cover-end-date-month'] = '02';
    mockRequest.body['cover-end-date-year'] = '2022';

    await validateAboutFacility(mockRequest, mockResponse);

    expect(updateFacilitySpy).toHaveBeenCalledWith('xyz', {
      coverEndDate: 'February 1, 2022',
      coverStartDate: 'December 3, 2022',
      hasCoverStartDate: null,
      monthsOfCover: null,
      name: undefined,
    });
  });

  it('shows error message if month of cover is not a number', async () => {
    const mockResponse = new MockResponse();
    const mockRequest = new MockRequest();
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.monthsOfCover = 'ab';

    await validateAboutFacility(mockRequest, mockResponse);

    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
      errors: expect.objectContaining({
        errorSummary: expect.arrayContaining([{ href: '#monthsOfCover', text: expect.any(String) }]),
      }),
    }));
  });
});

import { add, sub, format } from 'date-fns';
import {
  renderChangeFacilityPartial,
  changeUnissuedAboutFacility,
  changeUnissuedAboutFacilityChange,
  postChangeUnissuedAboutFacility,
  postChangeUnissuedAboutFacilityChange,
  facilityValidation,
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
  req.params.facilityName = 'Foundry4';
  req.session = {
    user: {
      bank: { id: 'BANKID' },
      roles: ['MAKER'],
    },
    userToken: 'TEST',
  };
  req.success = {
    message: 'Foundry4 is updated',
  };
  req.url = '/gef/application-details/123/unissued-facilities';
  return req;
};

const MockFacilityResponse = () => {
  const res = {};
  res.details = {
    type: 'CASH',
    name: 'Foundry4',
    hasBeenIssued: true,
    monthsOfCover: null,
    coverStartDate: '2022-01-02T00:00:00.000+00:00',
    shouldCoverStartOnSubmission: true,
    coverEndDate: '2030-01-02T00:00:00.000+00:00',
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
      coverStartDateYear: '2022',
      coverEndDateMonth: '1',
      coverEndDateYear: '2030',
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
      coverStartDateYear: '2022',
      coverEndDateMonth: '1',
      coverEndDateYear: '2030',
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
      coverStartDateYear: '2022',
      coverEndDateMonth: '1',
      coverEndDateYear: '2030',
      facilityTypeString: 'cash',
      applicationId: '123',
      facilityId: 'xyz',
      status: 'change',
      change: false,
    }));
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await renderChangeFacilityPartial(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
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

  it('changeUnissuedAboutFacility should call renderChangeFacilityPartial with false', async () => {
    mockRequest.query.status = 'change';
    const result = await changeUnissuedAboutFacility(mockRequest, mockResponse);
    console.log('result', result);
    const expected = await renderChangeFacilityPartial(mockRequest, mockResponse, false);

    expect(result).toEqual(expected);
  });

  it('changeUnissuedAboutFacility should not call renderChangeFacilityPartial with true', async () => {
    mockRequest.query.status = 'change';
    const result = await changeUnissuedAboutFacility(mockRequest, mockResponse);
    console.log('result', result);
    const expected = await renderChangeFacilityPartial(mockRequest, mockResponse, true);

    expect(result).not.toEqual(expected);
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    api.getFacility.mockRejectedValueOnce();
    await changeUnissuedAboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('postChangeUnissuedAboutFacility()', () => {
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

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  it('posts and returns correct message and url', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    await postChangeUnissuedAboutFacility(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('should not update facility if incorrect start and end dates', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    await postChangeUnissuedAboutFacility(mockRequest, mockResponse);
    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = 'CASH';

    api.updateFacility.mockRejectedValueOnce();
    await postChangeUnissuedAboutFacility(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('postChangeUnissuedAboutFacilityChange()', () => {
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

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const threeMonthsAndOneDayFromNow = add(now, { months: 3, days: 1 });
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

  it('posts and returns correct url', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    await postChangeUnissuedAboutFacilityChange(mockRequest, mockResponse);

    expect(api.updateFacility).toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(tomorrow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    '/gef/application-details/123');
  });

  it('should not update facility if incorrect start and end dates', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(threeMonthsAndOneDayFromNow, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonthsAndOneDayFromNow, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonthsAndOneDayFromNow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    await postChangeUnissuedAboutFacility(mockRequest, mockResponse);
    // should not go ahead with call as errors
    expect(api.updateFacility).not.toHaveBeenCalledWith('xyz', {
      coverEndDate: format(tomorrow, 'MMMM d, yyyy'),
      coverStartDate: format(oneYearFromNow, 'MMMM d, yyyy'),
      shouldCoverStartOnSubmission: null,
      monthsOfCover: null,
      name: 'Foundry4',
      hasBeenIssued: true,
      changedToIssued: true,
      coverDateConfirmed: true,
    },
    { message: 'Foundry4 is updated' },
    '/gef/application-details/123/unissued-facilities');
  });

  it('redirects user to `problem with service` page if there is an issue with the API', async () => {
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.facilityType = 'CASH';

    api.updateFacility.mockRejectedValueOnce();
    await postChangeUnissuedAboutFacilityChange(mockRequest, mockResponse);
    expect(mockResponse.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
  });
});

describe('validation()', () => {
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

  const now = new Date();
  const tomorrow = add(now, { days: 1 });
  const yesterday = sub(now, { days: 1 });

  it('returns correct object with no errors on correct facility update', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(now, 'd');
    mockRequest.body['cover-start-date-month'] = format(now, 'M');
    mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    const result = await facilityValidation(mockRequest, mockResponse);

    const expected = {
      coverStartDate: now,
      coverEndDate: tomorrow,
      body: mockRequest.body,
      facilityId: 'xyz',
      applicationId: '123',
    };
    // formatted to remove the millisecond mismatch (lag)
    const resultCoverStartFormatted = format(result.coverStartDate, 'dd mm yyyy');
    const resultCoverEndFormatted = format(result.coverEndDate, 'dd mm yyyy');
    const expectedCoverStartFormatted = format(expected.coverStartDate, 'dd mm yyyy');
    const expectedCoverEndFormatted = format(expected.coverEndDate, 'dd mm yyyy');

    // have to compare each part individually as compared to whole object
    // account for time mismatch due to difference in calls being 6ms
    expect(resultCoverStartFormatted).toEqual(expectedCoverStartFormatted);
    expect(resultCoverEndFormatted).toEqual(expectedCoverEndFormatted);
    expect(result.body).toEqual(expected.body);
    expect(result.facilityId).toEqual('xyz');
    expect(result.applicationId).toEqual('123');

    // does not render page with errors
    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/about-facility.njk');
  });

  it('should render template with errors if end date before start date', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
    mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
    mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

    const result = await facilityValidation(mockRequest, mockResponse);

    // expected error object format
    const expectedErrors = {
      errorSummary: [{
        href: '#coverEndDate',
        text: 'Cover end date cannot be before cover start date',
      }],
      fieldErrors: {
        coverEndDate: {
          text: 'Cover end date cannot be before cover start date',
        },
      },
    };
    // undefined as will be empty as errors
    expect(result).toEqual(undefined);

    // check ids and that errors is as expected
    expect(mockResponse.render).toHaveBeenCalledWith('partials/about-facility.njk', expect.objectContaining({
      applicationId: '123',
      facilityId: 'xyz',
      errors: expectedErrors,
    }));
  });
});

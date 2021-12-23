import { add, sub, format } from 'date-fns';
import { facilityValidation } from './validation';
import api from '../../services/api';
import MOCKS from '../mocks/index';

jest.mock('../../services/api');

describe('validation()', () => {
  let mockResponse;
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
    mockResponse = MOCKS.MockResponseUnissued();
    mockRequest = MOCKS.MockRequestUnissued();
    mockFacilityResponse = MOCKS.MockFacilityResponseUnissued();

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
  const oneYearFromNow = add(now, { years: 1, months: 3, days: 1 });

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
      dealId: '123',
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
    expect(result.dealId).toEqual('123');

    // does not render page with errors
    expect(mockResponse.render).not.toHaveBeenCalledWith('partials/about-facility.njk');
  });

  it('should render template with errors if end date before start date', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = '';
    mockRequest.body['issue-date-month'] = '';
    mockRequest.body['issue-date-year'] = '';

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
    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      dealId: '123',
      facilityId: 'xyz',
      errors: expectedErrors,
    }));
  });

  it('should render template with errors if start date before issue date', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(now, 'd');
    mockRequest.body['cover-start-date-month'] = format(now, 'M');
    mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    const result = await facilityValidation(mockRequest, mockResponse);

    // expected error object format
    const expectedErrors = {
      errorSummary: [{
        href: '#coverStartDate',
        text: 'Cover start date cannot be before the issue date',
      }],
      fieldErrors: {
        coverStartDate: {
          text: 'Cover start date cannot be before the issue date',
        },
      },
    };
    // undefined as will be empty as errors
    expect(result).toEqual(undefined);

    // check ids and that errors is as expected
    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      dealId: '123',
      facilityId: 'xyz',
      errors: expectedErrors,
    }));
  });

  it('should render template with errors if end date before issue date', async () => {
    mockRequest.body.facilityType = 'CASH';
    mockRequest.body.facilityName = 'Foundry4';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
    mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
    mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

    const result = await facilityValidation(mockRequest, mockResponse);

    // expected error object format
    const expectedErrors = {
      errorSummary: [
        {
          href: '#coverEndDate',
          text: 'Cover end date cannot be before cover start date',
        },
        {
          href: '#coverEndDate',
          text: 'Cover end date cannot be before the issue date',
        }],
      fieldErrors: {
        coverEndDate: {
          text: 'Cover end date cannot be before the issue date',
        },
      },
    };
    // undefined as will be empty as errors
    expect(result).toEqual(undefined);

    // check ids and that errors is as expected
    expect(mockResponse.render).toHaveBeenCalledWith('partials/unissued-change-about-facility.njk', expect.objectContaining({
      dealId: '123',
      facilityId: 'xyz',
      errors: expectedErrors,
    }));
  });
});

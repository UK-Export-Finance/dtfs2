import {
  add, sub, format, getUnixTime,
} from 'date-fns';
import { facilityValidation } from './validation';
import api from '../../services/api';
import MOCKS from '../mocks/index';
import CONSTANTS from '../../constants';

jest.mock('../../services/api');

describe('validation()', () => {
  let mockRequest;
  let mockFacilityResponse;

  beforeEach(() => {
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
  const threeMonths = add(now, { months: 3 });
  const oneMonthAgo = sub(now, { months: 1 });

  it('returns correct object with no errors on correct facility update', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.query.saveAndReturn = 'true';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';

    mockRequest.body['cover-start-date-day'] = format(now, 'd');
    mockRequest.body['cover-start-date-month'] = format(now, 'M');
    mockRequest.body['cover-start-date-year'] = format(now, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);
    const expected = {
      coverStartDate: now,
      coverEndDate: tomorrow,
      aboutFacilityErrors: [],
      facilityId: 'xyz',
      dealId: '123',
    };

    // formatted to remove the millisecond mismatch (lag)
    const resultCoverStartFormatted = format(result.coverStartDate, 'dd mm yyyy');
    const resultCoverEndFormatted = format(result.coverEndDate, 'dd mm yyyy');
    const expectedCoverStartFormatted = format(expected.coverStartDate, 'dd mm yyyy');
    const expectedCoverEndFormatted = format(expected.coverEndDate, 'dd mm yyyy');

    // as no errors expected, compare objects being passed back
    expect(resultCoverStartFormatted).toEqual(expectedCoverStartFormatted);
    expect(resultCoverEndFormatted).toEqual(expectedCoverEndFormatted);
    expect(result.facilityId).toEqual('xyz');
    expect(result.dealId).toEqual('123');
    expect(result.aboutFacilityErrors).toEqual(expected.aboutFacilityErrors);
  });

  it('Should return no error when cover start date is pre-populated from previous submission but cover start date is now same as issuance date', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.query.saveAndReturn = 'true';

    // Issue date set to submission date
    mockRequest.body['issue-date-day'] = format(now, 'd');
    mockRequest.body['issue-date-month'] = format(now, 'M');
    mockRequest.body['issue-date-year'] = format(now, 'yyyy');

    // Cover start date to be set as issue date (today)
    mockRequest.body.shouldCoverStartOnSubmission = 'true';

    // Cover start date set to yesterday - should be ignored due to cover start date set to issue date
    mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
    mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
    mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

    // Cover end date set to tomorrow
    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    // Validate
    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // Compare
    const expected = {
      coverStartDate: now,
      coverEndDate: tomorrow,
      aboutFacilityErrors: [],
      facilityId: 'xyz',
      dealId: '123',
    };

    // formatted to remove the millisecond mismatch (lag)
    const resultCoverStartFormatted = format(result.coverStartDate, 'dd mm yyyy');
    const resultCoverEndFormatted = format(result.coverEndDate, 'dd mm yyyy');
    const expectedCoverStartFormatted = format(expected.coverStartDate, 'dd mm yyyy');
    const expectedCoverEndFormatted = format(expected.coverEndDate, 'dd mm yyyy');

    // as no errors expected, compare objects being passed back
    expect(resultCoverStartFormatted).toEqual(expectedCoverStartFormatted);
    expect(resultCoverEndFormatted).toEqual(expectedCoverEndFormatted);
    expect(result.facilityId).toEqual('xyz');
    expect(result.dealId).toEqual('123');
    expect(result.aboutFacilityErrors).toEqual(expected.aboutFacilityErrors);
  });

  it('should return object with errors populated if end date before start date', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';
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

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // expected facility errors array
    const expectedFacilityErrors = [
      {
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before cover start date',
      },
    ];

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

    // check that errors are correct
    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with errors populated if end date before start date', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = '';
    mockRequest.body['issue-date-month'] = '';
    mockRequest.body['issue-date-year'] = '';

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-end-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-end-date-year'] = format(tomorrow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // expected facility errors array
    const expectedFacilityErrors = [
      {
        errRef: 'coverEndDate',
        errMsg: 'The cover end date must be after the cover start date',
      },
    ];

    // expected error object format
    const expectedErrors = {
      errorSummary: [{
        href: '#coverEndDate',
        text: 'The cover end date must be after the cover start date',
      }],
      fieldErrors: {
        coverEndDate: {
          text: 'The cover end date must be after the cover start date',
        },
      },
    };

    // check that errors are correct
    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with errors populated if start date before issue date', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(now, 'd');
    mockRequest.body['issue-date-month'] = format(now, 'M');
    mockRequest.body['issue-date-year'] = format(now, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(yesterday, 'd');
    mockRequest.body['cover-start-date-month'] = format(yesterday, 'M');
    mockRequest.body['cover-start-date-year'] = format(yesterday, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

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

    const expectedFacilityErrors = [{
      errRef: 'coverStartDate',
      errMsg: 'Cover start date cannot be before the issue date',
    }];

    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with errors populated if end date before issue date', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'true';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(now, 'd');
    mockRequest.body['issue-date-month'] = format(now, 'M');
    mockRequest.body['issue-date-year'] = format(now, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(yesterday, 'd');
    mockRequest.body['cover-end-date-month'] = format(yesterday, 'M');
    mockRequest.body['cover-end-date-year'] = format(yesterday, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

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

    const expectedFacilityErrors = [{
      errRef: 'coverEndDate',
      errMsg: 'Cover end date cannot be before cover start date',
    },
    {
      errRef: 'coverEndDate',
      errMsg: 'Cover end date cannot be before the issue date',
    }];

    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with errors populated if issue date in the future', async () => {
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(tomorrow, 'd');
    mockRequest.body['issue-date-month'] = format(tomorrow, 'M');
    mockRequest.body['issue-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(tomorrow, 'd');
    mockRequest.body['cover-start-date-month'] = format(tomorrow, 'M');
    mockRequest.body['cover-start-date-year'] = format(tomorrow, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // expected error object format
    const expectedErrors = {
      errorSummary: [
        {
          href: '#issueDate',
          text: 'The issue date cannot be in the future',
        }],
      fieldErrors: {
        issueDate: {
          text: 'The issue date cannot be in the future',
        },
      },
    };

    const expectedFacilityErrors = [{
      errRef: 'issueDate',
      errMsg: 'The issue date cannot be in the future',
    }];

    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with errors populated AIN and coverStartDate over 3 months in future from submission date', async () => {
    api.getApplication.mockResolvedValue({ submissionDate: `${getUnixTime(oneMonthAgo)}608` });
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(yesterday, 'd');
    mockRequest.body['issue-date-month'] = format(yesterday, 'M');
    mockRequest.body['issue-date-year'] = format(yesterday, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(threeMonths, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonths, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonths, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // expected error object format
    const expectedErrors = {
      errorSummary: [
        {
          href: '#coverStartDate',
          text: 'The cover start date must be within 3 months of the inclusion notice submission date',
        },
      ],
      fieldErrors: {
        coverStartDate: {
          text: 'The cover start date must be within 3 months of the inclusion notice submission date',
        },
      },
    };

    const expectedFacilityErrors = [{
      errRef: 'coverStartDate',
      errMsg: 'The cover start date must be within 3 months of the inclusion notice submission date',
    }];

    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });

  it('should return object with no errors if MIN and issue date 3 months from MIN submission date but 3 months from minSubmissionDate', async () => {
    api.getApplication.mockResolvedValue({ submissionDate: `${getUnixTime(oneMonthAgo)}608`, manualInclusionNoticeSubmissionDate: `${getUnixTime(now)}608` });
    mockRequest.body.facilityType = CONSTANTS.FACILITY_TYPE.CASH;
    mockRequest.body.facilityName = 'UKEF123';
    mockRequest.body.shouldCoverStartOnSubmission = 'false';
    mockRequest.query.saveAndReturn = 'true';

    mockRequest.body['issue-date-day'] = format(yesterday, 'd');
    mockRequest.body['issue-date-month'] = format(yesterday, 'M');
    mockRequest.body['issue-date-year'] = format(yesterday, 'yyyy');

    mockRequest.body['cover-start-date-day'] = format(threeMonths, 'd');
    mockRequest.body['cover-start-date-month'] = format(threeMonths, 'M');
    mockRequest.body['cover-start-date-year'] = format(threeMonths, 'yyyy');

    mockRequest.body['cover-end-date-day'] = format(oneYearFromNow, 'd');
    mockRequest.body['cover-end-date-month'] = format(oneYearFromNow, 'M');
    mockRequest.body['cover-end-date-year'] = format(oneYearFromNow, 'yyyy');

    const result = await facilityValidation(mockRequest.body, mockRequest.query, mockRequest.params);

    // expected error object format
    const expectedErrors = {
      errorSummary: [],
      fieldErrors: {},
    };

    const expectedFacilityErrors = [];

    expect(result.errorsObject.errors).toEqual(expectedErrors);
    expect(result.aboutFacilityErrors).toEqual(expectedFacilityErrors);
  });
});

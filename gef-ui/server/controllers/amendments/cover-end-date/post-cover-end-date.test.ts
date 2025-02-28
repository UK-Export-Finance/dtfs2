/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const getApplicationMock = jest.fn();
const getAmendmentMock = jest.fn();
const updateAmendmentMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { format, startOfDay } from 'date-fns';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  PortalFacilityAmendmentWithUkefId,
  DayMonthYearInput,
  getEpochMs,
} from '@ukef/dtfs2-common';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { validationErrorHandler } from '../../../utils/helpers';
import { getNextPage, getAmendmentsUrl } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { ValidationError } from '../../../types/validation-error';
import { postCoverEndDate, PostCoverEndDateRequest } from './post-cover-end-date';
import { validateAndParseCoverEndDate } from './validation';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  getAmendment: getAmendmentMock,
  updateAmendment: updateAmendmentMock,
}));

console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const aMockError = () => new Error();

const previousPage = 'previousPage';

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const today = startOfDay(new Date());

const getHttpMocks = (coverEndDateDayMonthYear: DayMonthYearInput = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') }) =>
  httpMocks.createMocks<PostCoverEndDateRequest>({
    params: {
      dealId,
      facilityId,
      amendmentId,
    },
    session: {
      user: mockUser,
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      previousPage,
      'cover-end-date-day': coverEndDateDayMonthYear.day,
      'cover-end-date-month': coverEndDateDayMonthYear.month,
      'cover-end-date-year': coverEndDateDayMonthYear.year,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postCoverEndDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeCoverEndDate(true)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should not call updateAmendment if the coverEndDate is invalid', async () => {
    // Arrange
    const coverEndDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if coverEndDate is invalid', async () => {
    // Arrange
    const coverEndDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    const expectedRenderData: CoverEndDateViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      errors: validationErrorHandler(
        (
          validateAndParseCoverEndDate(coverEndDateDayMonthYear, new Date(MOCK_ISSUED_FACILITY.details.coverStartDate as dtfsCommon.IsoDateTimeStamp)) as {
            errors: ValidationError[];
          }
        ).errors,
      ),
      coverEndDate: coverEndDateDayMonthYear,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/cover-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if the coverEndDate is valid', async () => {
    // Arrange
    const coverEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { coverEndDate: getEpochMs(today) }, userToken });
  });

  it('should not call console.error if the coverEndDate is valid', async () => {
    // Arrange
    const coverEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if coverEndDate is valid', async () => {
    // Arrange
    const coverEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, amendment));
  });

  it(`should redirect to the next page if coverEndDate is valid and the change query parameter is true`, async () => {
    // Arrange
    const coverEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(coverEndDateDayMonthYear);
    req.query = { change: 'true' };

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, amendment, req.query.change === 'true'));
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments cover end date page %o', mockError);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments cover end date page %o', mockError);
  });

  it('should render `problem with service` if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCoverEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments cover end date page %o', mockError);
  });
});

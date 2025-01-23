// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const getApplicationMock = jest.fn();
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
} from '@ukef/dtfs2-common';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { validationErrorHandler } from '../../../utils/helpers';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { ValidationError } from '../../../types/validation-error';
import { postFacilityEndDate, PostFacilityEndDateRequest } from './post-facility-end-date';
import * as facilityEndDateValidation from '../../facility-end-date/validation';
import { FacilityEndDateViewModel } from '../../../types/view-models/amendments/facility-end-date-view-model';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getFacility: getFacilityMock,
  updateAmendment: updateAmendmentMock,
}));

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const aMockError = () => new Error();

const previousPage = 'previousPage';

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const today = startOfDay(new Date());

const getHttpMocks = (facilityEndDateDayMonthYear: DayMonthYearInput = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') }) =>
  httpMocks.createMocks<PostFacilityEndDateRequest>({
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
      'facility-end-date-day': facilityEndDateDayMonthYear.day,
      'facility-end-date-month': facilityEndDateDayMonthYear.month,
      'facility-end-date-year': facilityEndDateDayMonthYear.year,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postFacilityEndDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');
    jest.spyOn(facilityEndDateValidation, 'validateAndParseFacilityEndDate');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withFacilityEndDate(today)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call validateAndParseFacilityEndDate', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(facilityEndDateValidation.validateAndParseFacilityEndDate).toHaveBeenCalledTimes(1);
    expect(facilityEndDateValidation.validateAndParseFacilityEndDate).toHaveBeenCalledWith(
      facilityEndDateDayMonthYear,
      getCoverStartDateOrToday(MOCK_ISSUED_FACILITY.details),
    );
  });

  it('should not call updateAmendment if the facilityEndDate is invalid', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if facilityEndDate is invalid', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    const expectedRenderData: FacilityEndDateViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage,
      errors: validationErrorHandler(
        (
          facilityEndDateValidation.validateAndParseFacilityEndDate(
            facilityEndDateDayMonthYear,
            new Date(MOCK_ISSUED_FACILITY.details.coverStartDate as dtfsCommon.IsoDateTimeStamp),
          ) as {
            errors: ValidationError[];
          }
        ).errors,
      ),
      facilityEndDate: facilityEndDateDayMonthYear,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-end-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if the facilityEndDate is valid', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { facilityEndDate: today }, userToken });
  });

  it('should not call console.error if the facilityEndDate is valid', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if facilityEndDate is valid', async () => {
    // Arrange
    const facilityEndDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(facilityEndDateDayMonthYear);

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_END_DATE, amendment));
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postFacilityEndDate(req, res);

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
    await postFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility end date page %o', mockError);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility end date page %o', mockError);
  });

  it('should render `problem with service` if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityEndDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility end date page %o', mockError);
  });
});

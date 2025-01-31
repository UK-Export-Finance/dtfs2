// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const getApplicationMock = jest.fn();
const updateAmendmentMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { format, getUnixTime, startOfDay } from 'date-fns';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  PortalFacilityAmendmentWithUkefId,
  DayMonthYearInput,
} from '@ukef/dtfs2-common';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today.ts';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { validationErrorHandler } from '../../../utils/helpers';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { ValidationError } from '../../../types/validation-error';
import { postEffectiveFrom, PostEffectiveFromRequest } from './post-effective-from';
import { EffectiveFromViewModel } from '../../../types/view-models/amendments/effective-from-view-model';
import { validateAndParseEffectiveFrom } from './validation.ts';

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

const getHttpMocks = (effectiveFromDayMonthYear: DayMonthYearInput = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') }) =>
  httpMocks.createMocks<PostEffectiveFromRequest>({
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
      'effective-from-day': effectiveFromDayMonthYear.day,
      'effective-from-month': effectiveFromDayMonthYear.month,
      'effective-from-year': effectiveFromDayMonthYear.year,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postEffectiveFrom', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withEffectiveFrom(getUnixTime(today))
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should not call updateAmendment if the effectiveFrom is invalid', async () => {
    // Arrange
    const effectiveFromDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(effectiveFromDayMonthYear);

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if effectiveFrom is invalid', async () => {
    // Arrange
    const effectiveFromDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(effectiveFromDayMonthYear);

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    const expectedRenderData: EffectiveFromViewModel = {
      exporterName: mockDeal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage,
      errors: validationErrorHandler(
        (
          validateAndParseEffectiveFrom(effectiveFromDayMonthYear, getCoverStartDateOrToday(MOCK_ISSUED_FACILITY.details)) as {
            errors: ValidationError[];
          }
        ).errors,
      ),
      effectiveFrom: effectiveFromDayMonthYear,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/effective-from.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if the effectiveFrom is valid', async () => {
    // Arrange
    const effectiveFromDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(effectiveFromDayMonthYear);

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { effectiveFrom: getUnixTime(today) }, userToken });
  });

  it('should not call console.error if the effectiveFrom is valid', async () => {
    // Arrange
    const effectiveFromDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(effectiveFromDayMonthYear);

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if effectiveFrom is valid', async () => {
    // Arrange
    const effectiveFromDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(effectiveFromDayMonthYear);

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE, amendment));
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postEffectiveFrom(req, res);

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
    await postEffectiveFrom(req, res);

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
    await postEffectiveFrom(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments effective from page %o', mockError);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments effective from page %o', mockError);
  });

  it('should render `problem with service` if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postEffectiveFrom(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments effective from page %o', mockError);
  });
});

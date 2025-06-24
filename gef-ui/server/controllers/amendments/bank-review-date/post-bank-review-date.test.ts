// TODO: DTFS2-7724 - remove this eslint-disable
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
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { getCoverStartDateOrToday } from '../../../utils/get-cover-start-date-or-today.ts';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { validationErrorHandler } from '../../../utils/helpers';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { ValidationError } from '../../../types/validation-error';
import { postBankReviewDate, PostBankReviewDateRequest } from './post-bank-review-date';
import * as bankReviewDateValidation from '../../bank-review-date/validation';
import { BankReviewDateViewModel } from '../../../types/view-models/amendments/bank-review-date-view-model';

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

const getHttpMocks = (bankReviewDateDayMonthYear: DayMonthYearInput = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') }) =>
  httpMocks.createMocks<PostBankReviewDateRequest>({
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
      'bank-review-date-day': bankReviewDateDayMonthYear.day,
      'bank-review-date-month': bankReviewDateDayMonthYear.month,
      'bank-review-date-year': bankReviewDateDayMonthYear.year,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postBankReviewDate', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');
    jest.spyOn(bankReviewDateValidation, 'validateAndParseBankReviewDate');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withBankReviewDate(today)
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
    await postBankReviewDate(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should call validateAndParseBankReviewDate', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(bankReviewDateValidation.validateAndParseBankReviewDate).toHaveBeenCalledTimes(1);
    expect(bankReviewDateValidation.validateAndParseBankReviewDate).toHaveBeenCalledWith(
      bankReviewDateDayMonthYear,
      getCoverStartDateOrToday(MOCK_ISSUED_FACILITY.details),
    );
  });

  it('should not call updateAmendment if the bankReviewDate is invalid', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if bankReviewDate is invalid', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = {
      day: '100',
      month: '100',
      year: '100',
    };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;
    const expectedRenderData: BankReviewDateViewModel = {
      exporterName: mockDeal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      previousPage,
      errors: validationErrorHandler(
        (
          bankReviewDateValidation.validateAndParseBankReviewDate(
            bankReviewDateDayMonthYear,
            new Date(MOCK_ISSUED_FACILITY.details.coverStartDate as dtfsCommon.IsoDateTimeStamp),
          ) as {
            errors: ValidationError[];
          }
        ).errors,
      ),
      bankReviewDate: bankReviewDateDayMonthYear,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/bank-review-date.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if the bankReviewDate is valid', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { bankReviewDate: today }, userToken });
  });

  it('should not call console.error if the bankReviewDate is valid', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if bankReviewDate is valid', async () => {
    // Arrange
    const bankReviewDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, amendment));
  });

  it(`should redirect to the next page if bankReviewDate is valid and the change query parameter is true`, async () => {
    // Arrange
    const bankReviewDateDayMonthYear = { day: format(today, 'd'), month: format(today, 'M'), year: format(today, 'yyyy') };
    const { req, res } = getHttpMocks(bankReviewDateDayMonthYear);
    req.query = { change: 'true' };

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, amendment, req.query.change === 'true'));
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postBankReviewDate(req, res);

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
    await postBankReviewDate(req, res);

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
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should render problem with service if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments bank review date page %o', mockError);
  });

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments bank review date page %o', mockError);
  });

  it('should render problem with service if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postBankReviewDate(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments bank review date page %o', mockError);
  });
});

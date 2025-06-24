// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getFacilityMock = jest.fn();
const getApplicationMock = jest.fn();
const getAmendmentMock = jest.fn();
const updateAmendmentMock = jest.fn();

import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  DEAL_SUBMISSION_TYPE,
  DEAL_STATUS,
  PortalFacilityAmendmentWithUkefId,
  PORTAL_AMENDMENT_STATUS,
} from '@ukef/dtfs2-common';
import { postFacilityValue, PostFacilityValueRequest } from './post-facility-value';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { getCurrencySymbol } from '../../../utils/get-currency-symbol';
import { validationErrorHandler } from '../../../utils/helpers';
import { validateFacilityValue } from './validation';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { ValidationError } from '../../../types/validation-error';

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

const getHttpMocks = (facilityValue: string = '10000') =>
  httpMocks.createMocks<PostFacilityValueRequest>({
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
      facilityValue,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postFacilityValue', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  let canMakerCancelAmendment: boolean;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withChangeFacilityValue(true)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    getAmendmentMock.mockResolvedValue(amendment);
    updateAmendmentMock.mockResolvedValue(amendment);

    canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should not call updateAmendment if the facilityValue is invalid', async () => {
    // Arrange
    const { req, res } = getHttpMocks('not a number');

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
  });

  it('should render the page with validation errors if facilityValue is empty', async () => {
    // Arrange
    const facilityValue = '';
    const facilityValueNumerical = dtfsCommon.getMonetaryValueAsNumber(facilityValue);
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    const expectedRenderData: FacilityValueViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      currencySymbol: getCurrencySymbol(MOCK_ISSUED_FACILITY.details.currency!.id),
      errors: validationErrorHandler((validateFacilityValue(facilityValueNumerical) as { errors: ValidationError[] }).errors),
      facilityValue,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should render the page with validation errors if facilityValue is invalid', async () => {
    // Arrange
    const facilityValue = 'not a number';
    const facilityValueNumerical = dtfsCommon.getMonetaryValueAsNumber(facilityValue);
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    const expectedRenderData: FacilityValueViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      currencySymbol: getCurrencySymbol(MOCK_ISSUED_FACILITY.details.currency!.id),
      errors: validationErrorHandler((validateFacilityValue(facilityValueNumerical) as { errors: ValidationError[] }).errors),
      facilityValue,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should render the page with validation errors if facilityValue is below 1', async () => {
    // Arrange
    const facilityValue = '0.99';
    const facilityValueNumerical = dtfsCommon.getMonetaryValueAsNumber(facilityValue);
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    const expectedRenderData: FacilityValueViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      currencySymbol: getCurrencySymbol(MOCK_ISSUED_FACILITY.details.currency!.id),
      errors: validationErrorHandler((validateFacilityValue(facilityValueNumerical) as { errors: ValidationError[] }).errors),
      facilityValue,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should render the page with validation errors if facilityValue is above 1 trillion', async () => {
    // Arrange
    const facilityValue = '1,000,000,000,000.01';
    const facilityValueNumerical = dtfsCommon.getMonetaryValueAsNumber(facilityValue);
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    const expectedRenderData: FacilityValueViewModel = {
      exporterName: mockDeal.exporter.companyName,
      facilityType: MOCK_ISSUED_FACILITY.details.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage,
      currencySymbol: getCurrencySymbol(MOCK_ISSUED_FACILITY.details.currency!.id),
      errors: validationErrorHandler((validateFacilityValue(facilityValueNumerical) as { errors: ValidationError[] }).errors),
      facilityValue,
      canMakerCancelAmendment,
    };

    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/amendments/facility-value.njk');
    expect(res._getRenderData()).toEqual(expectedRenderData);
  });

  it('should call updateAmendment if the facilityValue is valid', async () => {
    // Arrange
    const facilityValue = '1,000';
    const facilityValueNumerical = dtfsCommon.getMonetaryValueAsNumber(facilityValue);
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { value: Number(facilityValueNumerical) }, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should call updateAmendment if the facilityValue is valid, when javascript is disabled', async () => {
    // Arrange
    const facilityValue = '1000';
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
    expect(updateAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, update: { value: Number(facilityValue) }, userToken });
    expect(console.error).toHaveBeenCalledTimes(0);
  });

  it('should redirect to the next page if facilityValue is valid', async () => {
    // Arrange
    const facilityValue = '10000';
    const { req, res } = getHttpMocks(facilityValue);

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_VALUE, amendment));
  });

  it(`should redirect to the next page if facilityValue is valid and the change query parameter is true`, async () => {
    // Arrange
    const facilityValue = '10000';
    const { req, res } = getHttpMocks(facilityValue);
    req.query = { change: 'true' };

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_VALUE, amendment, req.query.change === 'true'));
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postFacilityValue(req, res);

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
    await postFacilityValue(req, res);

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
    await postFacilityValue(req, res);

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
    await postFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility value page %o', mockError);
  });

  it('should render problem with service if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility value page %o', mockError);
  });

  it('should render problem with service if updateAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    updateAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postFacilityValue(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments facility value page %o', mockError);
  });
});

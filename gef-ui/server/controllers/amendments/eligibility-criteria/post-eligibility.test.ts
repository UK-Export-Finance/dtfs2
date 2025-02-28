// TODO: DTFS2-7724 - remove this eslint-disable
/* eslint-disable import/first */
const getApplicationMock = jest.fn();
const getAmendmentMock = jest.fn();
const getFacilityMock = jest.fn();
const updateAmendmentMock = jest.fn();

import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, DEAL_STATUS, DEAL_SUBMISSION_TYPE, PORTAL_LOGIN_STATUS, ROLES, PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { validateEligibilityResponse } from './validation.ts';
import { EligibilityViewModel } from '../../../types/view-models/amendments/eligibility-view-model.ts';
import { EligibilityReqBody, parseEligibilityResponse } from '../helpers/eligibility.helper.ts';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { MOCK_ISSUED_FACILITY } from '../../../utils/mocks/mock-facilities';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { validationErrorHandler } from '../../../utils/helpers';
import { ValidationError } from '../../../types/validation-error';
import { postEligibility, PostEligibilityRequest } from './post-eligibility.ts';

jest.mock('../../../services/api', () => ({
  getApplication: getApplicationMock,
  getAmendment: getAmendmentMock,
  getFacility: getFacilityMock,
  updateAmendment: updateAmendmentMock,
}));

console.error = jest.fn();

const dealId = 'dealId';
const facilityId = 'facilityId';
const amendmentId = 'amendmentId';

const criteria = [
  {
    id: 1,
    text: 'Criterion 1',
    answer: null,
  },
  {
    id: 2,
    text: 'Criterion 2',
    textList: ['bullet 1', 'bullet 2'],
    answer: null,
  },
  {
    id: 3,
    text: 'Criterion 3',
    answer: null,
  },
];

const previousPage = 'previousPage';

const userToken = 'testToken';

const aMockError = () => new Error();

const getHttpMocks = (criteriaResponses: EligibilityReqBody = {}) =>
  createMocks<PostEligibilityRequest>({
    params: { dealId, facilityId, amendmentId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.MAKER] },
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
    body: {
      ...criteriaResponses,
      previousPage,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('postEligibility', () => {
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
      .withCriteria(criteria)
      .build();

    getApplicationMock.mockResolvedValue(mockDeal);
    getAmendmentMock.mockResolvedValue(amendment);
    getFacilityMock.mockResolvedValue(MOCK_ISSUED_FACILITY);
    updateAmendmentMock.mockResolvedValue(amendment);
  });

  it('should call getApplication with the correct dealId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(getApplicationMock).toHaveBeenCalledTimes(1);
    expect(getApplicationMock).toHaveBeenCalledWith({ dealId, userToken: req.session.userToken });
  });

  it('should call getFacility with the correct facilityId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(getFacilityMock).toHaveBeenCalledTimes(1);
    expect(getFacilityMock).toHaveBeenCalledWith({ facilityId, userToken: req.session.userToken });
  });

  it('should call getAmendment with the correct amendmentId and userToken', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(getAmendmentMock).toHaveBeenCalledWith({ facilityId, amendmentId, userToken: req.session.userToken });
  });

  it('should redirect if the facility is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getFacilityMock.mockResolvedValue({ details: undefined });

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getApplicationMock.mockResolvedValue(undefined);

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId, facilityId);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getApplicationMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments eligibility page %o', mockError);
  });

  it('should render `problem with service` if getFacility throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getFacilityMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments eligibility page %o', mockError);
  });

  it('should render `problem with service` if getAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postEligibility(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting amendments eligibility page %o', mockError);
  });

  describe('when there are missing criteria responses', () => {
    const responseWithMissingAnswers = {
      '1': 'true',
      '3': 'false',
    };

    it('should not call updateAmendment', async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithMissingAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      expect(updateAmendmentMock).toHaveBeenCalledTimes(0);
    });

    it('should render the page with validation errors', async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithMissingAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      const parsedResponse = parseEligibilityResponse(responseWithMissingAnswers, criteria);

      const expectedRenderData: EligibilityViewModel = {
        exporterName: mockDeal.exporter.companyName,
        facilityType: MOCK_ISSUED_FACILITY.details.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        errors: validationErrorHandler((validateEligibilityResponse(parsedResponse) as { errors: ValidationError[] }).errors),
        criteria: parsedResponse,
      };

      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getRenderView()).toEqual('partials/amendments/eligibility.njk');
      expect(res._getRenderData()).toEqual(expectedRenderData);
    });
  });

  describe('when answers to all criteria have been submitted', () => {
    const responseWithAllAnswers = {
      '1': 'true',
      '2': 'true',
      '3': 'false',
    };

    it('should call updateAmendment ', async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithAllAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      const parsedResponse = parseEligibilityResponse(responseWithAllAnswers, criteria);

      expect(updateAmendmentMock).toHaveBeenCalledTimes(1);
      expect(updateAmendmentMock).toHaveBeenCalledWith({
        facilityId,
        amendmentId,
        update: { eligibilityCriteria: { criteria: parsedResponse, version: amendment.eligibilityCriteria.version } },
        userToken,
      });
      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it('should not call console.error', async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithAllAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      expect(console.error).toHaveBeenCalledTimes(0);
    });

    it('should redirect to the next page', async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithAllAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.ELIGIBILITY, amendment));
    });

    it(`should redirect to the next page if change query parameter is true`, async () => {
      // Arrange
      const { req, res } = getHttpMocks(responseWithAllAnswers);
      req.query = { change: 'true' };

      // Act
      await postEligibility(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
      expect(res._getRedirectUrl()).toEqual(getNextPage(PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE, amendment, req.query.change === 'true'));
    });

    it('should render `problem with service` if updateAmendment throws an error', async () => {
      // Arrange
      const mockError = aMockError();
      updateAmendmentMock.mockRejectedValue(mockError);
      const { req, res } = getHttpMocks(responseWithAllAnswers);

      // Act
      await postEligibility(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('Error posting amendments eligibility page %o', mockError);
    });
  });
});

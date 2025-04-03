import * as dtfsCommon from '@ukef/dtfs2-common';
import { aPortalSessionUser, PORTAL_LOGIN_STATUS, ROLES, DEAL_STATUS, DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { createMocks } from 'node-mocks-http';
import { MOCK_BASIC_DEAL } from '../../../utils/mocks/mock-applications';
import { getAmendmentConfirmationPage, GetAmendmentConfirmationPageRequest } from './get-amendment-confirmation-page.ts';

jest.mock('../../../services/api');

const mockGetApplication = jest.fn();

const dealId = 'dealId';

const getHttpMocks = () =>
  createMocks<GetAmendmentConfirmationPageRequest>({
    params: { dealId },
    session: {
      user: { ...aPortalSessionUser(), roles: [ROLES.CHECKER] },
      userToken: 'testToken',
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    },
  });

const mockDeal = { ...MOCK_BASIC_DEAL, submissionType: DEAL_SUBMISSION_TYPE.AIN, status: DEAL_STATUS.UKEF_ACKNOWLEDGED };

describe('getAmendmentConfirmationPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);

    mockGetApplication.mockResolvedValue(mockDeal);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the submitAmendmentToUkef confirmation template', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act
    await getAmendmentConfirmationPage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    expect(res._getRenderView()).toEqual('partials/submit-to-ukef.njk');
  });

  it('should redirect if the deal is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    mockGetApplication.mockResolvedValue(undefined);

    // Act
    await getAmendmentConfirmationPage(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual('/not-found');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Deal %s or Facility %s was not found', dealId);
  });

  it('should render `problem with service` if getApplication throws an error', async () => {
    // Arrange
    mockGetApplication.mockRejectedValue(new Error('test error'));
    const { req, res } = getHttpMocks();

    // Act
    await getAmendmentConfirmationPage(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
  });
});

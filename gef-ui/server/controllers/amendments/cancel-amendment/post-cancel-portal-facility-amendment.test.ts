import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import * as dtfsCommon from '@ukef/dtfs2-common';
import {
  aPortalSessionUser,
  PORTAL_LOGIN_STATUS,
  PORTAL_AMENDMENT_STATUS,
  PortalFacilityAmendmentWithUkefId,
  InvalidAmendmentStatusError,
} from '@ukef/dtfs2-common';
import api from '../../../services/api';
import { PortalFacilityAmendmentWithUkefIdMockBuilder } from '../../../../test-helpers/mock-amendment';
import { postCancelPortalFacilityAmendment, PostCancelPortalFacilityAmendmentRequest } from './post-cancel-portal-facility-amendment';

const dealId = '6597dffeb5ef5ff4267e5044';
const facilityId = '6597dffeb5ef5ff4267e5045';
const amendmentId = '6597dffeb5ef5ff4267e5046';

const deleteAmendmentMock = jest.fn();
const getAmendmentMock = jest.fn();

const aMockError = () => new Error();

const mockUser = aPortalSessionUser();
const userToken = 'userToken';

const facilityValue = 20000;

const effectiveDateWithoutMs = Number(new Date()) / 1000;
const coverEndDate = Number(new Date());
const facilityEndDate = new Date();

const getHttpMocks = () =>
  httpMocks.createMocks<PostCancelPortalFacilityAmendmentRequest>({
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
  });

describe('postCancelPortalFacilityAmendment', () => {
  let amendment: PortalFacilityAmendmentWithUkefId;
  beforeEach(() => {
    jest.resetAllMocks();

    jest.spyOn(dtfsCommon, 'isPortalFacilityAmendmentsFeatureFlagEnabled').mockReturnValue(true);
    jest.spyOn(api, 'deleteAmendment').mockImplementation(deleteAmendmentMock);
    jest.spyOn(api, 'getAmendment').mockImplementation(getAmendmentMock);
    jest.spyOn(console, 'error');

    amendment = new PortalFacilityAmendmentWithUkefIdMockBuilder()
      .withDealId(dealId)
      .withFacilityId(facilityId)
      .withAmendmentId(amendmentId)
      .withStatus(PORTAL_AMENDMENT_STATUS.DRAFT)
      .withChangeCoverEndDate(true)
      .withCoverEndDate(coverEndDate)
      .withIsUsingFacilityEndDate(true)
      .withFacilityEndDate(facilityEndDate)
      .withChangeFacilityValue(true)
      .withFacilityValue(facilityValue)
      .withEffectiveDate(effectiveDateWithoutMs)
      .build();

    getAmendmentMock.mockResolvedValue(amendment);
    deleteAmendmentMock.mockResolvedValue(undefined);
  });

  it('should call deleteAmendment with the correct facilityId, amendmentId, userToken and email variables', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const emptyEmailVariables = {
      exporterName: '',
      bankInternalRefName: '',
      ukefDealId: '',
      ukefFacilityId: '',
      makersName: '',
      checkersName: '',
      dateEffectiveFrom: '',
      newCoverEndDate: '',
      newFacilityEndDate: '',
      newFacilityValue: '',
    };

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(deleteAmendmentMock).toHaveBeenCalledWith({
      facilityId,
      amendmentId,
      userToken,
      makersEmail: '',
      checkersEmail: '',
      emailVariables: emptyEmailVariables,
    });
  });

  it('should redirect to details page after amendment has been deleted', async () => {
    // Arrange
    const { req, res } = getHttpMocks();

    // Act,
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRedirectUrl()).toEqual(`/gef/application-details/${dealId}`);
  });

  it('should redirect to "/not-found" if the amendment is not found', async () => {
    // Arrange
    const { req, res } = getHttpMocks();
    getAmendmentMock.mockResolvedValue(undefined);

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.Found);
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Amendment %s was not found for the facility %s', amendmentId, facilityId);
  });

  it(`should render problem with service if the amendment is not ${PORTAL_AMENDMENT_STATUS.DRAFT}`, async () => {
    // Arrange
    getAmendmentMock.mockReturnValue({ ...amendment, status: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL });
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(`Amendment %s on facility %s is not %s`, amendmentId, facilityId, PORTAL_AMENDMENT_STATUS.DRAFT);
    expect(console.error).toHaveBeenCalledWith(
      'Error posting cancel amendments page %o',
      new InvalidAmendmentStatusError(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL),
    );
  });

  it('should render problem with service if getAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    getAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(getAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting cancel amendments page %o', mockError);
  });

  it('should render problem with service if deleteAmendment throws an error', async () => {
    // Arrange
    const mockError = aMockError();
    deleteAmendmentMock.mockRejectedValue(mockError);
    const { req, res } = getHttpMocks();

    // Act
    await postCancelPortalFacilityAmendment(req, res);

    // Assert
    expect(deleteAmendmentMock).toHaveBeenCalledTimes(1);
    expect(res._getRenderView()).toEqual('partials/problem-with-service.njk');
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Error posting cancel amendments page %o', mockError);
  });
});

import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import api from '../../../../api';
import { cancelUtilisationReportCorrection, CancelUtilisationReportCorrectionRequest } from './index';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/cancel-correction', () => {
  const bankId = '123';
  const userId = 'user-id';
  const mockUser = {
    _id: userId,
    bank: {
      id: bankId,
    },
  };

  const userToken = 'token';
  const requestSession = {
    user: mockUser,
    userToken,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  };

  const correctionId = '7';

  const getHttpMocks = () =>
    httpMocks.createMocks<CancelUtilisationReportCorrectionRequest>({
      params: { correctionId },
      session: requestSession,
    });

  let req: CancelUtilisationReportCorrectionRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    ({ req, res } = getHttpMocks());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should delete the form data', async () => {
    // Arrange

    // Act
    await cancelUtilisationReportCorrection(req, res);

    // Assert
    expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
    expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(userToken, bankId, correctionId);
  });

  it('should redirect to the utilisation report home page after successful deletion of form data', async () => {
    // Arrange
    jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockResolvedValue(undefined);

    // Act
    await cancelUtilisationReportCorrection(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual('/utilisation-report-upload');
  });

  it('should render the "problem with service" page when cancellation fails', async () => {
    // Arrange
    jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error());

    // Act
    await cancelUtilisationReportCorrection(req, res);

    // Assert
    expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    expect(res._getRenderData()).toEqual({ user: mockUser });
  });
});

import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { getProvideUtilisationReportCorrection, GetProvideUtilisationReportCorrectionRequest } from '.';
import { mapToCorrectionRequestDetailsViewModel } from './helpers';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const bankId = '123';
  const mockUser = {
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

  describe('getProvideUtilisationReportCorrection', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<GetProvideUtilisationReportCorrectionRequest>({
        params: { correctionId },
        session: requestSession,
      });

    const feeRecordCorrectionResponse = aGetFeeRecordCorrectionResponseBody();

    let req: GetProvideUtilisationReportCorrectionRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(feeRecordCorrectionResponse);

      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should render the "provide utilisation report correction" page', async () => {
      // Arrange
      const expectedCorrectionRequestDetails = mapToCorrectionRequestDetailsViewModel(feeRecordCorrectionResponse);

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk');
      expect(res._getRenderData() as ProvideUtilisationReportCorrectionViewModel).toEqual<ProvideUtilisationReportCorrectionViewModel>({
        primaryNav: PRIMARY_NAV_KEY.REPORTS,
        correctionRequestDetails: expectedCorrectionRequestDetails,
      });
    });

    it('should fetch the fee record correction using the correction id and users bank id', async () => {
      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(api.getFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);
    });

    it('should render the "problem with service" page when fetching the fee record correction fails', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrection).mockRejectedValue(new Error());

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(api.getFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);

      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });
});

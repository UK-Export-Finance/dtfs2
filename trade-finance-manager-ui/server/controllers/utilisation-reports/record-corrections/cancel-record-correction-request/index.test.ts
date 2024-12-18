import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { postCancelRecordCorrectionRequest, PostCancelRecordCorrectionRequestRequest } from '.';
import api from '../../../../api';
import { getLinkToPremiumPaymentsTab } from '../../helpers';

jest.mock('../../../../api');

describe('controllers/utilisation-reports/record-corrections/cancel-record-correction-request', () => {
  const reportId = '123';
  const feeRecordId = '456';

  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('postCancelRecordCorrectionRequest', () => {
    let req: PostCancelRecordCorrectionRequestRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      }));
    });

    it('should redirect to premium payments tab, with fee records selected, on success', async () => {
      // Act
      await postCancelRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]));
    });

    it('should clear transient form data', async () => {
      // Act
      await postCancelRecordCorrectionRequest(req, res);

      // Assert
      expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
      expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, user, userToken);
    });

    it('should render problem with service page on error', async () => {
      // Arrange
      jest.mocked(api.deleteFeeRecordCorrectionTransientFormData).mockRejectedValue(new Error('API Error'));

      // Act
      await postCancelRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user });
    });
  });
});

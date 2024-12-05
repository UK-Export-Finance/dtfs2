import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../helpers/get-link-to-premium-payments-tab';
import { getRecordCorrectionRequestInformation, postRecordCorrectionRequestInformation } from '.';
import api from '../../../../api';

jest.mock('../../../../api');

describe('controllers/utilisation-reports/record-corrections/check-the-information', () => {
  const reportId = '123';
  const feeRecordId = '456';

  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  describe('getRecordCorrectionRequestInformation', () => {
    it('should render check the information page', () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      // Act
      getRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/check-the-information.njk');
      expect(res._getRenderData()).toEqual({
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank: { name: 'Test bank' },
        reportId,
        feeRecordId: '456',
        facilityId: '0012345678',
        exporter: 'Test company',
        formattedReportPeriod: 'July 2024',
        reasonForRecordCorrection: 'Facility ID is incorrect',
        additionalInfo: 'The facility ID does not match the facility ID held on file',
        contactEmailAddress: 'email address',
        cancelLink: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
      });
    });
  });

  describe('postRecordCorrectionRequestInformation', () => {
    it('should redirect to request sent page on success', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(api.createFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.createFeeRecordCorrection).toHaveBeenCalledWith(reportId, feeRecordId, user, userToken);
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/request-sent`);
    });

    it('should render problem with service page on error', async () => {
      // Arrange
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId },
      });

      jest.mocked(api.createFeeRecordCorrection).mockRejectedValue(new Error('API Error'));

      // Act
      await postRecordCorrectionRequestInformation(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user });
    });
  });
});

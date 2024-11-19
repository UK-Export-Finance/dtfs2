import httpMocks from 'node-mocks-http';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getLinkToPremiumPaymentsTab } from '../../add-to-an-existing-payment/get-link-to-premium-payments-tab';
import { getRecordCorrectionRequestInformation } from '.';

describe('controllers/utilisation-reports/record-corrections/check-the-information', () => {
  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  describe('getRecordCorrectionRequestInformation', () => {
    it('should render check the information page', () => {
      // Arrange
      const reportId = '123';
      const feeRecordId = '456';
      const { req, res } = httpMocks.createMocks({
        session: requestSession,
        params: { reportId, feeRecordId: feeRecordId.toString() },
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
        moreInformation: 'The facility ID does not match the facility ID held on file',
        contactEmailAddress: 'email address',
        cancelLink: getLinkToPremiumPaymentsTab(reportId, [Number(feeRecordId)]),
      });
    });
  });
});

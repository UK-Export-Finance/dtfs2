import httpMocks from 'node-mocks-http';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { MOCK_PORTAL_SESSION_USER } from '../../../../test-mocks/mock-portal-session-user';
import { getReportConfirmAndSend } from '..';
import { PRIMARY_NAV_KEY } from '../../../../constants';

describe('controllers/utilisation-report-service/utilisation-report-upload', () => {
  describe('getReportConfirmAndSend', () => {
    const reportPeriodSessionData = {
      formattedReportPeriod: 'January to March 2023',
      reportPeriod: { start: { month: 1, year: 2023 }, end: { month: 3, year: 2023 } },
    };

    const getHttpMocks = (utilisationReport?: object) =>
      httpMocks.createMocks({
        session: {
          userToken: 'user-token',
          user: MOCK_PORTAL_SESSION_USER,
          loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
          utilisationReport,
        },
      });

    it.each([
      { description: 'there is no report in the session', utilisationReport: undefined },
      { description: 'the session report has no file buffer or report data', utilisationReport: reportPeriodSessionData },
      { description: 'the session report has no file buffer', utilisationReport: { ...reportPeriodSessionData, reportData: [] } },
      { description: 'the session report has no report data', utilisationReport: { ...reportPeriodSessionData, fileBuffer: Buffer.from('') } },
    ])('should redirect to the utilisation-report-upload page if $description', ({ utilisationReport }) => {
      // Arrange
      const { req, res } = getHttpMocks(utilisationReport);

      // Act
      getReportConfirmAndSend(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/utilisation-report-upload');
    });

    it("should render the 'confirm-and-send' page if the session report has a file buffer and report data", () => {
      // Arrange
      const filename = 'test-report.xlsx';
      const { req, res } = getHttpMocks({
        ...reportPeriodSessionData,
        fileBuffer: Buffer.from('file'),
        reportData: [],
        filename,
      });

      // Act
      getReportConfirmAndSend(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/utilisation-report-upload/confirm-and-send.njk');
      expect(res._getRenderData()).toEqual({
        user: MOCK_PORTAL_SESSION_USER,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        filename,
      });
    });
  });
});

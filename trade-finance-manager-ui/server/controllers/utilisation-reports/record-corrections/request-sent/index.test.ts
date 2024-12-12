import httpMocks from 'node-mocks-http';
import { getFormattedReportPeriodWithLongMonth } from '@ukef/dtfs2-common';
import { aGetFeeRecordResponseBody, aTfmSessionUser } from '../../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { getRecordCorrectionRequestSent } from '.';
import api from '../../../../api';

jest.mock('../../../../api');

describe('controllers/utilisation-reports/record-corrections/request-sent', () => {
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

  describe('getRecordCorrectionRequestSent', () => {
    const emailsWithoutRequestedByUserEmail = ['test1@ukexportfinance.gov.uk', 'test2@ukexportfinance.gov.uk'];
    const emails = [user.email, ...emailsWithoutRequestedByUserEmail];

    const feeRecordResponse = aGetFeeRecordResponseBody();

    const { req, res } = httpMocks.createMocks({
      session: requestSession,
      params: { reportId, feeRecordId },
    });

    beforeEach(() => {
      jest.mocked(api.getFeeRecord).mockResolvedValue(feeRecordResponse);
    });

    it('should render "request sent" page', async () => {
      // Arrange
      req.session.recordCorrectionRequestEmails = emails;
      const expectedRequestedByUserEmail = user.email;

      // Act
      await getRecordCorrectionRequestSent(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/request-sent.njk');
      expect(res._getRenderData()).toEqual({
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        bank: { name: feeRecordResponse.bank.name },
        reportId,
        formattedReportPeriod: getFormattedReportPeriodWithLongMonth(feeRecordResponse.reportPeriod),
        requestedByUserEmail: expectedRequestedByUserEmail,
        emailsWithoutRequestedByUserEmail,
      });
    });

    it('should render the problem with service page if the record correction request emails are not set in the session', async () => {
      // Arrange
      req.session.recordCorrectionRequestEmails = undefined;

      // Act
      await getRecordCorrectionRequestSent(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });

    it(`should clear the record correction request emails in the session data`, async () => {
      // Arrange
      req.session.recordCorrectionRequestEmails = emails;

      // Act
      await getRecordCorrectionRequestSent(req, res);

      // Assert
      expect(req.session.recordCorrectionRequestEmails).toBeUndefined();
    });
  });
});

import httpMocks, { MockResponse, Session } from 'node-mocks-http';
import { Request, Response } from 'express';
import { aPortalSessionBank, aPortalSessionUser, getFormattedReportPeriodWithLongMonth, PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import { getRecordCorrectionSent } from '..';
import { RecordCorrectionSentViewModel } from '../../../../types/view-models/record-correction/record-correction-confirmation';
import { LoggedInUserSession } from '../../../../helpers/express-session';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/record-correction-sent', () => {
  describe('getProvideUtilisationReportCorrection', () => {
    const bankId = '123';

    const mockUser = {
      ...aPortalSessionUser(),
      bank: {
        ...aPortalSessionBank(),
        id: bankId,
      },
    };

    const userToken = 'token';

    const loggedInSessionData = {
      user: mockUser,
      userToken,
      loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    };

    const getHttpMocks = (sessionData: Session) =>
      httpMocks.createMocks({
        session: sessionData,
      });

    let req: Request;
    let res: MockResponse<Response>;
    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when there is NO record correction sent data saved in the session', () => {
      beforeEach(() => {
        ({ req, res } = getHttpMocks(loggedInSessionData));
      });

      it('should render the "problem with service" page', () => {
        // Act
        getRecordCorrectionSent(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        expect(res._getRenderData()).toEqual({ user: mockUser });
      });
    });

    describe('when there is record correction sent data saved in the session', () => {
      const sentToEmails = ['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk'];
      const reportPeriod = { start: { month: 1, year: 2021 }, end: { month: 3, year: 2021 } };

      const sessionDataWithCorrectionSentData = {
        ...loggedInSessionData,
        recordCorrectionSent: {
          sentToEmails,
          reportPeriod,
        },
      };

      beforeEach(() => {
        ({ req, res } = getHttpMocks(sessionDataWithCorrectionSentData));
      });

      it('should render the "record correction sent" page', () => {
        // Act
        getRecordCorrectionSent(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/correction-sent.njk');
        expect(res._getRenderData()).toEqual<RecordCorrectionSentViewModel>({
          user: mockUser,
          primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
          formattedReportPeriod: getFormattedReportPeriodWithLongMonth(reportPeriod),
          sentToEmails,
        });
      });

      it('should remove the record correction sent data from the session', () => {
        // Act
        getRecordCorrectionSent(req, res);

        // Assert
        expect((req.session as LoggedInUserSession).recordCorrectionSent).toBeUndefined();
      });
    });
  });
});

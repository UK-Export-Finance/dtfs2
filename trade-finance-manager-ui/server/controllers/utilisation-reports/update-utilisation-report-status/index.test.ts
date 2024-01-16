import httpMocks from 'node-mocks-http';
import api from '../../../api';
import * as getUtilisationReportsController from '..';
import { UpdateUtilisationReportStatusRequest, UpdateUtilisationReportStatusRequestBody, updateUtilisationReportStatus } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
import { TEAM_IDS } from '../../../constants';
import { ReportWithStatus } from '../../../types/utilisation-reports';

console.error = jest.fn();

jest.mock('../../../api');
jest.mock('..');

describe('controllers/utilisation-reports/update-utilisation-report-status', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('updateUtilisationReportStatus', () => {
    const errorSpy = jest.spyOn(global, 'Error');
    const userToken = 'user-token';
    const session = {
      userToken,
      user: { ...MOCK_TFM_SESSION_USER, teams: [TEAM_IDS.PDC_RECONCILE] },
    };
    const validBody: UpdateUtilisationReportStatusRequestBody = {
      _csrf: 'csrf',
      'form-button': 'completed',
      'submission-month': '2024-01',
      'set-status--bankId-123': 'on',
      'set-status--reportId-abc123': 'on',
    };

    const getPostRequestMocks = ({ body }: { body: undefined | Partial<UpdateUtilisationReportStatusRequestBody> }) =>
      httpMocks.createMocks<UpdateUtilisationReportStatusRequest>({ session, body });

    it("renders the 'problem-with-service' page when the request body is undefined", async () => {
      // Arrange
      const { req, res } = getPostRequestMocks({ body: undefined });
      // @ts-expect-error 'req.body' should normally never be undefined
      req.body = undefined;

      // Act
      await updateUtilisationReportStatus(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(errorSpy).toHaveBeenCalledWith('Expected request body to be an object');
    });

    it("renders the 'problem-with-service' page when the request does not contain the 'form-button' field", async () => {
      // Arrange
      const body: Partial<UpdateUtilisationReportStatusRequestBody> = {
        ...validBody,
        'form-button': undefined,
      };
      const { req, res } = getPostRequestMocks({ body });

      // Act
      await updateUtilisationReportStatus(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
    });

    it("renders the 'problem-with-service' page if the value of 'form-button' is invalid", async () => {
      // Arrange
      const body: Partial<UpdateUtilisationReportStatusRequestBody> = {
        ...validBody,
        'form-button': 'invalid-value',
      };
      const { req, res } = getPostRequestMocks({ body });

      // Act
      await updateUtilisationReportStatus(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(errorSpy).toHaveBeenCalledWith("form-button body parameter of 'invalid-value' does not match either 'completed' or 'not-completed'");
    });

    it("renders the 'problem-with-service' page if 'submission-month' is not a valid iso month string", async () => {
      // Arrange
      const body: Partial<UpdateUtilisationReportStatusRequestBody> = {
        ...validBody,
        'submission-month': 'March 2023',
      };
      const { req, res } = getPostRequestMocks({ body });

      // Act
      await updateUtilisationReportStatus(req, res);

      // Assert
      // eslint-disable-next-line no-underscore-dangle
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(errorSpy).toHaveBeenCalledWith("Invalid ISO month 'March 2023' - expected a string in format 'yyyy-MM'");
    });

    describe('for a valid payload body', () => {
      const getUtilisationReportsSpy = jest.spyOn(getUtilisationReportsController, 'getUtilisationReports');
      const apiUpdateUtilisationReportStatusSpy = jest.spyOn(api, 'updateUtilisationReportStatus');
      const expectedReportsWithStatus: ReportWithStatus[] = [
        {
          status: 'RECONCILIATION_COMPLETED',
          report: {
            bankId: '123',
            month: expect.any(Number) as number,
            year: expect.any(Number) as number,
          },
        },
        {
          status: 'RECONCILIATION_COMPLETED',
          report: {
            id: 'abc123',
          },
        },
      ];

      it("calls 'getUtilisationReports' without calling 'api.updateUtilisationReportStatus' when there are no update instructions", async () => {
        // Arrange
        const body: Partial<UpdateUtilisationReportStatusRequestBody> = {
          _csrf: validBody._csrf,
          'form-button': validBody['form-button'],
          'submission-month': validBody['submission-month'],
        };
        const { req, res } = getPostRequestMocks({ body });

        // Act
        await updateUtilisationReportStatus(req, res);

        // Assert
        expect(getUtilisationReportsSpy).toHaveBeenCalled();
        expect(apiUpdateUtilisationReportStatusSpy).not.toHaveBeenCalled();
      });

      it("calls 'getUtilisationReports' and 'api.updateUtilisationReportStatus' when there are update instructions", async () => {
        // Arrange
        const body: Partial<UpdateUtilisationReportStatusRequestBody> = validBody;
        const { req, res } = getPostRequestMocks({ body });

        // Act
        await updateUtilisationReportStatus(req, res);

        // Assert
        expect(getUtilisationReportsSpy).toHaveBeenCalled();
        expect(apiUpdateUtilisationReportStatusSpy).toHaveBeenCalledWith(MOCK_TFM_SESSION_USER, expectedReportsWithStatus, userToken);
      });
    });
  });
});

import httpMocks from 'node-mocks-http';
import api from '../../../api';
import * as getUtilisationReportsController from '..';
import { UpdateUtilisationReportStatusRequest, UpdateUtilisationReportStatusRequestBody, updateUtilisationReportStatus } from '.';
import { MOCK_TFM_SESSION_USER } from '../../../test-mocks/mock-tfm-session-user';
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
      user: MOCK_TFM_SESSION_USER,
    };

    const validMongoObjectId = '5ce819935e539c343f141ece';
    const validBody: UpdateUtilisationReportStatusRequestBody = {
      _csrf: 'csrf',
      'form-button': 'completed',
      [`set-status--reportId-${validMongoObjectId}`]: 'on',
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
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(errorSpy).toHaveBeenCalledWith("form-button body parameter of 'invalid-value' does not match either 'completed' or 'not-completed'");
    });

    describe('for a valid payload body', () => {
      const getUtilisationReportsSpy = jest.spyOn(getUtilisationReportsController, 'getUtilisationReports');
      const apiUpdateUtilisationReportStatusSpy = jest.spyOn(api, 'updateUtilisationReportStatus');
      const expectedReportsWithStatus: ReportWithStatus[] = [
        {
          status: 'RECONCILIATION_COMPLETED',
          reportId: validMongoObjectId,
        },
      ];

      it("calls 'getUtilisationReports' without calling 'api.updateUtilisationReportStatus' when there are no update instructions", async () => {
        // Arrange
        const body: Partial<UpdateUtilisationReportStatusRequestBody> = {
          _csrf: validBody._csrf,
          'form-button': validBody['form-button'],
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

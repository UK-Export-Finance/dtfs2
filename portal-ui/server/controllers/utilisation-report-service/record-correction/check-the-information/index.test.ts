import { aPortalSessionUser, aFeeRecordCorrectionReviewInformation, aPortalSessionBank } from "@ukef/dtfs2-common/test-helpers";
import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import {
  CURRENCY,
  FeeRecordCorrectionReviewInformation,
  getFormattedMonetaryValue,
  mapReasonsToDisplayValues,
  PORTAL_LOGIN_STATUS,
} from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { getUtilisationReportCorrectionReview, UtilisationReportCorrectionReviewRequest, postUtilisationReportCorrectionReview } from '.';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../types/view-models/record-correction/utilisation-report-correction-information';
import { SaveFeeRecordCorrectionResponseBody } from '../../../../api-response-types';
import { LoggedInUserSession } from '../../../../helpers/express-session';
import { getRecordCorrectionCancelLinkHref } from '../../../../helpers';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/check-the-information', () => {
  const bankId = '123';
  const userId = 'user-id';
  const mockUser = {
    ...aPortalSessionUser(),
    _id: userId,
    bank: {
      ...aPortalSessionBank(),
      id: bankId,
    },
  };

  const userToken = 'token';
  const aRequestSession = () => ({
    user: mockUser,
    userToken,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  });

  const correctionId = '7';

  const getHttpMocks = () =>
    httpMocks.createMocks<UtilisationReportCorrectionReviewRequest>({
      params: { correctionId },
      session: aRequestSession(),
    });

  let req: UtilisationReportCorrectionReviewRequest;
  let res: MockResponse<Response>;

  beforeEach(() => {
    ({ req, res } = getHttpMocks());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getUtilisationReportCorrectionReview', () => {
    it('should render the "utilisation report correction - check the information" page', async () => {
      // Arrange
      const exporter = 'An exporter';
      const reportedFeesCurrency = CURRENCY.GBP;
      const reportedFeesAmount = 1234.56;
      const bankCommentary = 'Some bank commentary';

      const feeRecordCorrectionReviewResponse = {
        ...aFeeRecordCorrectionReviewInformation(),
        bankCommentary,
        feeRecord: {
          exporter,
          reportedFees: {
            currency: reportedFeesCurrency,
            amount: reportedFeesAmount,
          },
        },
      };

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(feeRecordCorrectionReviewResponse);

      const { errorSummary, formattedOldValues, formattedNewValues, reasons } = feeRecordCorrectionReviewResponse;

      const expectedFormattedReasons = mapReasonsToDisplayValues(reasons).join(', ');

      const expectedFeeRecord = {
        exporter,
        reportedFees: {
          currency: reportedFeesCurrency,
          formattedAmount: getFormattedMonetaryValue(reportedFeesAmount),
        },
      };

      // Act
      await getUtilisationReportCorrectionReview(req, res);

      // Assert
      const expectedResponse: UtilisationReportCorrectionInformationViewModel = {
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        cancelLinkHref: getRecordCorrectionCancelLinkHref(correctionId),
        backLinkHref: `/utilisation-reports/provide-correction/${correctionId}`,
        feeRecord: expectedFeeRecord,
        formattedReasons: expectedFormattedReasons,
        errorSummary,
        formattedOldValues,
        formattedNewValues,
        bankCommentary,
      };

      expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/check-the-information.njk');

      expect(res._getRenderData() as UtilisationReportCorrectionInformationViewModel).toEqual(expectedResponse);
    });

    it('should fetch the fee record correction using the correction id and users bank id', async () => {
      // Arrange
      const feeRecordCorrectionReviewResponse = aFeeRecordCorrectionReviewInformation();

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(feeRecordCorrectionReviewResponse);

      // Act
      await getUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionReview).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionReview).toHaveBeenCalledWith(bankId, correctionId, userId, userToken);
    });

    it('should render bankCommentary field with value "-" when the bankCommentary is null', async () => {
      // Arrange
      const feeRecordCorrectionReviewResponse: FeeRecordCorrectionReviewInformation = {
        ...aFeeRecordCorrectionReviewInformation(),
        bankCommentary: null,
      };

      jest.mocked(api.getFeeRecordCorrectionReview).mockResolvedValue(feeRecordCorrectionReviewResponse);

      // Act
      await getUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/check-the-information.njk');

      expect((res._getRenderData() as UtilisationReportCorrectionInformationViewModel).bankCommentary).toEqual('-');
    });

    it('should render the "problem with service" page when fetching the fee record correction review information fails', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrectionReview).mockRejectedValue(new Error());

      // Act
      await getUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });

  describe('postUtilisationReportCorrectionReview', () => {
    const aSaveFeeRecordCorrectionResponseBody = (): SaveFeeRecordCorrectionResponseBody => ({
      sentToEmails: ['email1@ukexportfinance.gov.uk', 'email2@ukexportfinance.gov.uk'],
      reportPeriod: { start: { month: 1, year: 2021 }, end: { month: 3, year: 2021 } },
    });

    it('should save the fee record correction', async () => {
      // Arrange
      jest.mocked(api.saveFeeRecordCorrection).mockResolvedValue(aSaveFeeRecordCorrectionResponseBody());

      // Act
      await postUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(api.saveFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.saveFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);
    });

    it('should redirect to the record correction sent page', async () => {
      // Arrange
      jest.mocked(api.saveFeeRecordCorrection).mockResolvedValue(aSaveFeeRecordCorrectionResponseBody());

      // Act
      await postUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual('/utilisation-reports/correction-sent');
    });

    it('should save the record correction sent data to the session', async () => {
      // Arrange
      const recordCorrectionSentData = aSaveFeeRecordCorrectionResponseBody();
      jest.mocked(api.saveFeeRecordCorrection).mockResolvedValue(recordCorrectionSentData);

      // Act
      await postUtilisationReportCorrectionReview(req, res);

      // Assert
      expect((req.session as LoggedInUserSession).recordCorrectionSent).toEqual(recordCorrectionSentData);
    });

    it('should render the "problem with service" page when fetching the fee record correction review information fails', async () => {
      // Arrange
      jest.mocked(api.saveFeeRecordCorrection).mockRejectedValue(new Error());

      // Act
      await postUtilisationReportCorrectionReview(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });
});

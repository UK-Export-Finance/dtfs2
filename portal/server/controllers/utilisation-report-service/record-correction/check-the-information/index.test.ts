import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import {
  aFeeRecordCorrectionReviewInformation,
  aPortalSessionBank,
  aPortalSessionUser,
  CURRENCY,
  FeeRecordCorrectionReviewInformation,
  getFormattedMonetaryValue,
  mapReasonsToDisplayValues,
  PORTAL_LOGIN_STATUS,
} from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { getUtilisationReportCorrectionReview, GetUtilisationReportCorrectionReviewRequest } from '.';
import { UtilisationReportCorrectionInformationViewModel } from '../../../../types/view-models/record-correction/utilisation-report-correction-information';

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
  const requestSession = {
    user: mockUser,
    userToken,
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
  };

  const correctionId = '7';

  describe('getUtilisationReportCorrectionReview', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<GetUtilisationReportCorrectionReviewRequest>({
        params: { correctionId },
        session: requestSession,
      });

    let req: GetUtilisationReportCorrectionReviewRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should render the "utilisation report correction - check the information" page', async () => {
      // Arrange,
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
          amount: getFormattedMonetaryValue(reportedFeesAmount),
        },
      };

      // Act
      await getUtilisationReportCorrectionReview(req, res);

      // Assert
      const expectedResponse: UtilisationReportCorrectionInformationViewModel = {
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
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

    it('should render bankCommentary field with value "-" when the bankCommentary is undefined', async () => {
      // Arrange
      const feeRecordCorrectionReviewResponse: FeeRecordCorrectionReviewInformation = {
        ...aFeeRecordCorrectionReviewInformation(),
        bankCommentary: undefined,
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
});

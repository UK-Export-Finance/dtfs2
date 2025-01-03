import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import { aPortalSessionUser, mapCurrenciesToRadioItems, PORTAL_LOGIN_STATUS, RECORD_CORRECTION_REASON, RecordCorrectionReason } from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import { getProvideUtilisationReportCorrection, GetProvideUtilisationReportCorrection } from '.';
import { getAdditionalCommentsFieldLabels, mapToCorrectionRequestDetailsViewModel } from './helpers';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';
import { aBank } from '../../../../../test-helpers/test-data';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const bankId = '123';
  const mockUser = {
    ...aPortalSessionUser(),
    bank: {
      ...aBank(),
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

  describe('getProvideUtilisationReportCorrection', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<GetProvideUtilisationReportCorrection>({
        params: { correctionId },
        session: requestSession,
      });

    let req: GetProvideUtilisationReportCorrection;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should render the "provide utilisation report correction" page', async () => {
      // Arrange
      const reasons = [RECORD_CORRECTION_REASON.OTHER];
      const feeRecordCorrectionResponse = {
        ...aGetFeeRecordCorrectionResponseBody(),
        reasons,
      };

      jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(feeRecordCorrectionResponse);

      const expectedCorrectionRequestDetails = mapToCorrectionRequestDetailsViewModel(feeRecordCorrectionResponse);
      const expectedPaymentCurrencyOptions = mapCurrenciesToRadioItems();
      const { label: expectedAdditionalCommentsLabel, hint: expectedAdditionalCommentsHint } = getAdditionalCommentsFieldLabels(reasons);

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk');

      expect(res._getRenderData() as ProvideUtilisationReportCorrectionViewModel).toEqual<ProvideUtilisationReportCorrectionViewModel>({
        user: mockUser,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        correctionRequestDetails: expectedCorrectionRequestDetails,
        paymentCurrencyOptions: expectedPaymentCurrencyOptions,
        additionalComments: {
          label: expectedAdditionalCommentsLabel,
          hint: expectedAdditionalCommentsHint,
        },
      });
    });

    it('should fetch the fee record correction using the correction id and users bank id', async () => {
      // Arrange
      const feeRecordCorrectionResponse = aGetFeeRecordCorrectionResponseBody();

      jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(feeRecordCorrectionResponse);

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(api.getFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);
    });

    describe.each`
      description   | reasons
      ${'includes'} | ${[RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.OTHER]}
      ${'excludes'} | ${[RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT, RECORD_CORRECTION_REASON.UTILISATION_INCORRECT]}
    `(`when the fee record correction reasons $description '${RECORD_CORRECTION_REASON.OTHER}'`, ({ reasons }: { reasons: RecordCorrectionReason[] }) => {
      it('should render the expected additional comments labels', async () => {
        // Arrange
        const feeRecordCorrectionResponse = {
          ...aGetFeeRecordCorrectionResponseBody(),
          reasons,
        };

        jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(feeRecordCorrectionResponse);

        const { label: expectedLabel, hint: expectedHint } = getAdditionalCommentsFieldLabels(reasons);

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        const viewModel = res._getRenderData() as ProvideUtilisationReportCorrectionViewModel;

        expect(viewModel.additionalComments.label).toEqual(expectedLabel);
        expect(viewModel.additionalComments.hint).toEqual(expectedHint);
      });
    });

    it('should render the "problem with service" page when fetching the fee record correction fails', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrection).mockRejectedValue(new Error());

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });

      expect(api.getFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);
    });
  });
});

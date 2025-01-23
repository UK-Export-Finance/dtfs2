import httpMocks, { MockResponse } from 'node-mocks-http';
import { Response } from 'express';
import {
  aPortalSessionBank,
  aPortalSessionUser,
  aRecordCorrectionFormValues,
  CURRENCY,
  mapCurrenciesToRadioItems,
  PORTAL_LOGIN_STATUS,
  RECORD_CORRECTION_REASON,
  RecordCorrectionReason,
} from '@ukef/dtfs2-common';
import { PRIMARY_NAV_KEY } from '../../../../constants';
import api from '../../../../api';
import {
  getProvideUtilisationReportCorrection,
  GetProvideUtilisationReportCorrection,
  PostProvideUtilisationReportCorrectionRequest,
  postProvideUtilisationReportCorrection,
} from '.';
import { getAdditionalCommentsFieldLabels, mapToProvideCorrectionFormValuesViewModel, mapToCorrectionRequestDetailsViewModel } from './helpers';
import { ProvideUtilisationReportCorrectionViewModel } from '../../../../types/view-models/record-correction/provide-utilisation-report-correction';
import { aGetFeeRecordCorrectionResponseBody } from '../../../../../test-helpers/test-data/get-fee-record-correction-response';
import { GetFeeRecordCorrectionTransientFormDataResponseBody } from '../../../../api-response-types';

jest.mock('../../../../api');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const bankId = '123';
  const mockUser = {
    ...aPortalSessionUser(),
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

    describe('when the user visits the page from a link on the Report GEF utilisation and fees page', () => {
      beforeEach(() => {
        req.headers.referer = 'utilisation-report-upload';
      });

      it('should clear any saved form data for the correction', async () => {
        // Arrange
        jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(aGetFeeRecordCorrectionResponseBody());

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
        expect(api.deleteFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(userToken, bankId, correctionId);
      });

      it('should NOT attempt to fetch saved form data', async () => {
        // Arrange
        jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(aGetFeeRecordCorrectionResponseBody());

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        expect(api.getFeeRecordCorrectionTransientFormData).not.toHaveBeenCalled();
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

        const expected = {
          user: mockUser,
          primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
          correctionRequestDetails: expectedCorrectionRequestDetails,
          paymentCurrencyOptions: expectedPaymentCurrencyOptions,
          additionalComments: {
            label: expectedAdditionalCommentsLabel,
            hint: expectedAdditionalCommentsHint,
          },
          formValues: mapToProvideCorrectionFormValuesViewModel({}),
        };

        expect(res._getRenderData() as ProvideUtilisationReportCorrectionViewModel).toEqual<ProvideUtilisationReportCorrectionViewModel>(expected);
      });
    });

    describe('when the user visits the page from a page other than the Report GEF utilisation and fees page', () => {
      beforeEach(() => {
        req.headers.referer = 'some-other-page';
      });

      it('should fetch the fee record correction transient form data using the correction id and users bank id', async () => {
        // Arrange
        jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(aGetFeeRecordCorrectionResponseBody());
        jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
        expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(userToken, bankId, correctionId);
      });

      it('should NOT attempt to delete saved form data', async () => {
        // Arrange
        jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(aGetFeeRecordCorrectionResponseBody());

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        expect(api.deleteFeeRecordCorrectionTransientFormData).not.toHaveBeenCalled();
      });

      describe('when there are NOT any saved form values', () => {
        beforeEach(() => {
          jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});
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

          const expected = {
            user: mockUser,
            primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
            correctionRequestDetails: expectedCorrectionRequestDetails,
            paymentCurrencyOptions: expectedPaymentCurrencyOptions,
            additionalComments: {
              label: expectedAdditionalCommentsLabel,
              hint: expectedAdditionalCommentsHint,
            },
            formValues: mapToProvideCorrectionFormValuesViewModel({}),
          };

          expect(res._getRenderData() as ProvideUtilisationReportCorrectionViewModel).toEqual<ProvideUtilisationReportCorrectionViewModel>(expected);
        });
      });

      describe('when there are saved form values', () => {
        const savedFormValues: GetFeeRecordCorrectionTransientFormDataResponseBody = {
          facilityId: '123',
          additionalComments: 'Some comments',
          reportedCurrency: CURRENCY.GBP,
        };

        beforeEach(() => {
          jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue(savedFormValues);
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
          const expectedPaymentCurrencyOptions = mapCurrenciesToRadioItems(savedFormValues.reportedCurrency);
          const { label: expectedAdditionalCommentsLabel, hint: expectedAdditionalCommentsHint } = getAdditionalCommentsFieldLabels(reasons);

          // Act
          await getProvideUtilisationReportCorrection(req, res);

          // Assert
          expect(res._getRenderView()).toEqual('utilisation-report-service/record-correction/provide-utilisation-report-correction.njk');

          const expected = {
            user: mockUser,
            primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
            correctionRequestDetails: expectedCorrectionRequestDetails,
            paymentCurrencyOptions: expectedPaymentCurrencyOptions,
            additionalComments: {
              label: expectedAdditionalCommentsLabel,
              hint: expectedAdditionalCommentsHint,
            },
            formValues: mapToProvideCorrectionFormValuesViewModel(savedFormValues),
          };

          expect(res._getRenderData() as ProvideUtilisationReportCorrectionViewModel).toEqual<ProvideUtilisationReportCorrectionViewModel>(expected);
        });
      });
    });

    it('should fetch the fee record correction using the correction id and users bank id', async () => {
      // Arrange
      const feeRecordCorrectionResponse = aGetFeeRecordCorrectionResponseBody();

      jest.mocked(api.getFeeRecordCorrection).mockResolvedValue(feeRecordCorrectionResponse);
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});

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
        jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});

        const { label: expectedLabel, hint: expectedHint } = getAdditionalCommentsFieldLabels(reasons);

        // Act
        await getProvideUtilisationReportCorrection(req, res);

        // Assert
        const viewModel = res._getRenderData() as ProvideUtilisationReportCorrectionViewModel;

        expect(viewModel.additionalComments.label).toEqual(expectedLabel);
        expect(viewModel.additionalComments.hint).toEqual(expectedHint);
      });
    });

    it('should render the "problem with service" page when an error occurs', async () => {
      // Arrange
      jest.mocked(api.getFeeRecordCorrection).mockRejectedValue(new Error());
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue({});

      // Act
      await getProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });

      expect(api.getFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId);
    });
  });

  describe('postProvideUtilisationReportCorrection', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<PostProvideUtilisationReportCorrectionRequest>({
        params: { correctionId },
        session: requestSession,
        body: aRecordCorrectionFormValues(),
      });

    let req: PostProvideUtilisationReportCorrectionRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      ({ req, res } = getHttpMocks());
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should redirect to the 'check the information' screen if no errors", async () => {
      // Arrange
      jest.mocked(api.putFeeRecordCorrection);

      const expectedRedirectUrl = `/utilisation-reports/provide-correction/${correctionId}/check-the-information`;

      // Act
      await postProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(expectedRedirectUrl);
    });

    it('should call the "putFeeRecordCorrection" api endpoint once with the correct parameters', async () => {
      // Arrange
      const formData = aRecordCorrectionFormValues();
      req.body = formData;

      // Act
      await postProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(api.putFeeRecordCorrection).toHaveBeenCalledTimes(1);
      expect(api.putFeeRecordCorrection).toHaveBeenCalledWith(userToken, bankId, correctionId, formData);
    });

    it('should render the "problem with service" page when an error occurs', async () => {
      // Arrange
      const formData = aRecordCorrectionFormValues();
      req.body = formData;

      jest.mocked(api.putFeeRecordCorrection).mockRejectedValue(new Error());

      // Act
      await postProvideUtilisationReportCorrection(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: mockUser });
    });
  });
});

import httpMocks from 'node-mocks-http';
import { RECORD_CORRECTION_REASON } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL,
  getCreateRecordCorrectionRequest,
  GetCreateRecordCorrectionRequestRequest,
  PostCreateRecordCorrectionRequestRequest,
  postCreateRecordCorrectionRequest,
} from '.';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { CreateRecordCorrectionRequestFormRequestBody } from './form-helpers';
import { validateCreateRecordCorrectionRequestFormValues } from './validate-form-values';
import api from '../../../../api';
import { GetFeeRecordResponseBody } from '../../../../api-response-types';
import { getLinkToPremiumPaymentsTab } from '../../helpers';

jest.mock('../../../../api');
jest.mock('./validate-form-values');

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/create-record-correction-request', () => {
  const userToken = 'user-token';
  const user = aTfmSessionUser();
  const requestSession = {
    userToken,
    user,
  };

  const reportId = '123';
  const feeRecordId = '456';

  beforeEach(() => {
    const feeRecordResponse: GetFeeRecordResponseBody = {
      id: 456,
      bank: {
        id: '789',
        name: 'Test Bank',
      },
      reportPeriod: {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      },
      facilityId: '0012345678',
      exporter: 'Sample Company Ltd',
    };
    jest.mocked(api.getFeeRecord).mockResolvedValue(feeRecordResponse);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('getCreateRecordCorrectionRequest', () => {
    const getHttpMocks = () =>
      httpMocks.createMocks<GetCreateRecordCorrectionRequestRequest>({
        params: { reportId, feeRecordId },
        session: requestSession,
      });

    it('should render the create record correction request page', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      await getCreateRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/create-record-correction-request.njk');
      expect(res._getRenderData() as CreateRecordCorrectionRequestViewModel).toEqual<CreateRecordCorrectionRequestViewModel>({
        bank: { name: 'Test Bank' },
        user,
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
        reportId,
        formattedReportPeriod: 'January 2024',
        feeRecord: {
          facilityId: '0012345678',
          exporter: 'Sample Company Ltd',
        },
        formValues: {},
        errors: { errorSummary: [] },
        backLinkHref: getLinkToPremiumPaymentsTab(reportId, [456]),
      });

      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
    });
  });

  describe('postCreateRecordCorrectionRequest', () => {
    beforeEach(() => {
      jest.mocked(validateCreateRecordCorrectionRequestFormValues).mockReturnValue(EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when the form values are valid', () => {
      const validBody = {
        reasons: [RECORD_CORRECTION_REASON.OTHER],
        additionalInfo: 'Some additional info',
      };

      const getHttpMocks = () =>
        httpMocks.createMocks<PostCreateRecordCorrectionRequestRequest>({
          params: { reportId, feeRecordId },
          session: requestSession,
          body: validBody,
        });

      it('redirects to the "check the information" page', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/check-the-information`);
        expect(api.getFeeRecord).not.toHaveBeenCalled();

        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledTimes(1);
        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledWith(validBody);
      });
    });

    describe('when the form values are not valid', () => {
      const errors: CreateRecordCorrectionRequestErrorsViewModel = {
        errorSummary: [{ text: 'Some text', href: '#some-href' }],
      };

      beforeEach(() => {
        jest.mocked(validateCreateRecordCorrectionRequestFormValues).mockReturnValue(errors);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      const getHttpMocks = (body?: CreateRecordCorrectionRequestFormRequestBody) =>
        httpMocks.createMocks<PostCreateRecordCorrectionRequestRequest>({
          params: { reportId, feeRecordId },
          session: requestSession,
          body,
        });

      it('should render the create record correction request page', async () => {
        // Arrange
        const body = {};
        const { req, res } = getHttpMocks(body);

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('utilisation-reports/record-corrections/create-record-correction-request.njk');
        expect(res._getRenderData() as CreateRecordCorrectionRequestViewModel).toEqual({
          bank: { name: 'Test Bank' },
          user,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
          reportId,
          formattedReportPeriod: 'January 2024',
          feeRecord: {
            facilityId: '0012345678',
            exporter: 'Sample Company Ltd',
          },
          formValues: { reasons: [] },
          errors,
          backLinkHref: getLinkToPremiumPaymentsTab(reportId, [456]),
        });

        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledTimes(1);
        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledWith({ reasons: [] });

        expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
        expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
      });

      it('should set the render view model formValues "reasons" to the valid request body reasons', async () => {
        // Arrange
        const validReasons = [RECORD_CORRECTION_REASON.OTHER, RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT];

        const body = { reasons: [...validReasons, 'invalid-reason'] };
        const { req, res } = getHttpMocks(body);

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        const viewModel = res._getRenderData() as CreateRecordCorrectionRequestViewModel;
        expect(viewModel.formValues.reasons).toEqual(validReasons);

        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledTimes(1);
        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledWith({ reasons: validReasons });

        expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
        expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
      });

      it('should set the render view model formValues "additionalInfo" to the request body additionalInfo', async () => {
        // Arrange
        const additionalInfo = 'Some additional info';

        const body = { additionalInfo };
        const { req, res } = getHttpMocks(body);

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        const viewModel = res._getRenderData() as CreateRecordCorrectionRequestViewModel;
        expect(viewModel.formValues.additionalInfo).toEqual(additionalInfo);

        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledTimes(1);
        expect(validateCreateRecordCorrectionRequestFormValues).toHaveBeenCalledWith({ additionalInfo, reasons: [] });

        expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
        expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
      });
    });
  });
});

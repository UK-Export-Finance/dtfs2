import httpMocks from 'node-mocks-http';
import { RECORD_CORRECTION_REQUEST_REASON } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL,
  getCreateRecordCorrectionRequest,
  GetCreateRecordCorrectionRequestRequest,
  postCreateRecordCorrectionRequest,
} from '.';
import { CreateRecordCorrectionRequestErrorsViewModel, CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { CreateRecordCorrectionRequestFormRequestBody } from './form-helpers';
import { validateCreateRecordCorrectionRequestFormValues } from './validate-form-values';

console.error = jest.fn();

jest.mock('./validate-form-values');

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
    jest.mocked(validateCreateRecordCorrectionRequestFormValues).mockReturnValue(EMPTY_CREATE_RECORD_CORRECTION_REQUEST_ERRORS_VIEW_MODEL);
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

    it('should render create record correction request page', () => {
      // Arrange
      const { req, res } = getHttpMocks();

      // Act
      getCreateRecordCorrectionRequest(req, res);

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
      });
    });
  });

  describe('postCreateRecordCorrectionRequest', () => {
    describe('when the form values are valid', () => {
      const getHttpMocks = () =>
        httpMocks.createMocks<GetCreateRecordCorrectionRequestRequest>({
          params: { reportId, feeRecordId },
          session: requestSession,
          body: aPostCreateRecordCorrectionRequestBody(),
        });

      it('redirects to the "check the information" page', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        postCreateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/check-the-information`);
      });

      function aPostCreateRecordCorrectionRequestBody(): CreateRecordCorrectionRequestFormRequestBody {
        return {
          reasons: [RECORD_CORRECTION_REQUEST_REASON.OTHER],
          additionalInfo: 'Some additional info',
        };
      }
    });

    describe('when the form values are not valid', () => {
      const errors: CreateRecordCorrectionRequestErrorsViewModel = {
        errorSummary: [{ text: 'Some text', href: '#some-href' }],
      };

      beforeEach(() => {
        jest.mocked(validateCreateRecordCorrectionRequestFormValues).mockReturnValue(errors);
      });

      const getHttpMocks = () =>
        httpMocks.createMocks<GetCreateRecordCorrectionRequestRequest>({
          params: { reportId, feeRecordId },
          session: requestSession,
          body: {},
        });

      it('should render the create record correction request page', () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        postCreateRecordCorrectionRequest(req, res);

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
        });
      });

      it('should set the render view model formValues reasons to the valid request body reasons', () => {
        // Arrange
        const validReasons = [RECORD_CORRECTION_REQUEST_REASON.OTHER, RECORD_CORRECTION_REQUEST_REASON.REPORTED_FEE_INCORRECT];

        const { req, res } = getHttpMocks();
        req.body = { reasons: [...validReasons, 'invalid-reason'] };

        // Act
        postCreateRecordCorrectionRequest(req, res);

        // Assert
        const viewModel = res._getRenderData() as CreateRecordCorrectionRequestViewModel;
        expect(viewModel.formValues.reasons).toEqual(validReasons);
      });

      it('should set the render view model formValues additionalInfo to the request body additionalInfo', () => {
        // Arrange
        const additionalInfo = 'Some additional info';

        const { req, res } = getHttpMocks();
        req.body = { additionalInfo };

        // Act
        postCreateRecordCorrectionRequest(req, res);

        // Assert
        const viewModel = res._getRenderData() as CreateRecordCorrectionRequestViewModel;
        expect(viewModel.formValues.additionalInfo).toEqual(additionalInfo);
      });
    });
  });
});

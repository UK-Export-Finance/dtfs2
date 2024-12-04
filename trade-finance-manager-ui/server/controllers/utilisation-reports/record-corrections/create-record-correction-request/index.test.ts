import httpMocks, { MockResponse } from 'node-mocks-http';
import { RECORD_CORRECTION_REASON, RecordCorrectionTransientFormData } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { aTfmSessionUser } from '../../../../../test-helpers';
import {
  getCreateRecordCorrectionRequest,
  GetCreateRecordCorrectionRequestRequest,
  PostCreateRecordCorrectionRequestRequest,
  postCreateRecordCorrectionRequest,
} from '.';
import { CreateRecordCorrectionRequestViewModel } from '../../../../types/view-models';
import { PRIMARY_NAVIGATION_KEYS } from '../../../../constants';
import { CreateRecordCorrectionRequestFormRequestBody } from './form-helpers';
import { validateCreateRecordCorrectionRequestFormValues } from './validate-form-values';
import api from '../../../../api';
import { GetFeeRecordResponseBody } from '../../../../api-response-types';
import { getLinkToPremiumPaymentsTab } from '../../helpers';

jest.mock('../../../../api');

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

    const transientFormDataResponse: RecordCorrectionTransientFormData = {
      reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
      additionalInfo: 'Some additional info',
    };

    let req: GetCreateRecordCorrectionRequestRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      jest.mocked(api.getFeeRecordCorrectionTransientFormData).mockResolvedValue(transientFormDataResponse);

      ({ req, res } = getHttpMocks());
    });

    it('should render the create record correction request page', async () => {
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
        formValues: transientFormDataResponse,
        errors: { errorSummary: [] },
        backLinkHref: getLinkToPremiumPaymentsTab(reportId, [456]),
      });
    });

    it('should fetch the fee record details using the reportId and feeRecordId', async () => {
      // Act
      await getCreateRecordCorrectionRequest(req, res);

      // Assert
      expect(api.getFeeRecord).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecord).toHaveBeenCalledWith(reportId, feeRecordId, userToken);
    });

    it('should fetch the fee record correction transient form data using the reportId, feeRecordId, and user', async () => {
      // Act
      await getCreateRecordCorrectionRequest(req, res);

      // Assert
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
      expect(api.getFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, user, userToken);
    });
  });

  describe('postCreateRecordCorrectionRequest', () => {
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

      it('should make an api call to update the transient form data', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        expect(api.updateFeeRecordCorrectionTransientFormData).toHaveBeenCalledTimes(1);
        expect(api.updateFeeRecordCorrectionTransientFormData).toHaveBeenCalledWith(reportId, feeRecordId, validBody, user, userToken);
      });

      it('should redirect to the "check the information" page', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postCreateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/check-the-information`);
        expect(api.getFeeRecord).not.toHaveBeenCalled();
      });
    });

    describe('when the form values are not valid', () => {
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

        const { errors } = validateCreateRecordCorrectionRequestFormValues(body);

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
      });

      it('should fetch the fee record details using the reportId and feeRecordId', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await getCreateRecordCorrectionRequest(req, res);

        // Assert
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
      });
    });
  });
});

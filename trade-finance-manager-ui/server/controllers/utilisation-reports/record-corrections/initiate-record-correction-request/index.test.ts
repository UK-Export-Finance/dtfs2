import httpMocks from 'node-mocks-http';
import { FEE_RECORD_STATUS, FeeRecordStatus } from '@ukef/dtfs2-common';
import difference from 'lodash.difference';
import { postInitiateRecordCorrectionRequest, PostInitiateRecordCorrectionRequest } from '.';
import { INITIATE_RECORD_CORRECTION_ERROR_KEY } from '../../../../constants/premium-payment-tab-error-keys';
import { PremiumPaymentsTableCheckboxSelectionsRequestBody } from '../../helpers';
import { PremiumPaymentsTableCheckboxId } from '../../../../types/premium-payments-table-checkbox-id';
import { aTfmSessionUser } from '../../../../../test-helpers';

console.error = jest.fn();

describe('controllers/utilisation-reports/record-corrections/initiate-record-correction-request', () => {
  const aRequestSession = () => ({
    userToken: 'user-token',
    user: aTfmSessionUser(),
  });

  describe.each`
    testName                                     | requestBody
    ${'when no checkboxes are selected'}         | ${{}}
    ${'when an invalid checkbox id is provided'} | ${{ 'feeRecordIds--reportedPaymentsCurrency-GBP-status-TO_DO': 'on' }}
  `('$testName', ({ requestBody }: { requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody }) => {
    it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED}' error`, () => {
      // Arrange
      const reportId = '123';
      const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
        params: { reportId },
        session: aRequestSession(),
        body: requestBody,
      });

      // Act
      postInitiateRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
      expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.NO_FEE_RECORDS_SELECTED);
      expect(req.session.checkedCheckboxIds).toEqual({});
    });
  });

  describe('when multiple checkboxes are selected', () => {
    const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
      'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
      'feeRecordIds-789-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
    };

    const expectedCheckedCheckboxIds = {
      'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': true,
      'feeRecordIds-789-reportedPaymentsCurrency-GBP-status-TO_DO': true,
    };

    it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED}' error`, () => {
      // Arrange
      const reportId = '123';
      const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
        params: { reportId },
        session: aRequestSession(),
        body: requestBody,
      });

      // Act
      postInitiateRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
      expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.MULTIPLE_FEE_RECORDS_SELECTED);
      expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
    });
  });

  describe.each(difference(Object.values(FEE_RECORD_STATUS), [FEE_RECORD_STATUS.TO_DO]))(
    'when a checkbox in status %s is selected',
    (status: FeeRecordStatus) => {
      const checkboxId: PremiumPaymentsTableCheckboxId = `feeRecordIds-456-reportedPaymentsCurrency-GBP-status-${status}`;
      const requestBody = {
        [checkboxId]: 'on',
      };

      const expectedCheckedCheckboxIds = {
        [checkboxId]: true,
      };

      it(`should redirect to premium payments page with '${INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS}' error`, () => {
        // Arrange
        const reportId = '123';
        const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
          params: { reportId },
          session: aRequestSession(),
          body: requestBody,
        });

        // Act
        postInitiateRecordCorrectionRequest(req, res);

        // Assert
        expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}`);
        expect(req.session.initiateRecordCorrectionRequestErrorKey).toEqual(INITIATE_RECORD_CORRECTION_ERROR_KEY.INVALID_STATUS);
        expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
      });
    },
  );

  describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected`, () => {
    const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
      'feeRecordIds-456-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
    };

    it(`should redirect to create record coorection request page`, () => {
      // Arrange
      const reportId = '123';
      const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
        params: { reportId },
        session: aRequestSession(),
        body: requestBody,
      });

      // Act
      postInitiateRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/utilisation-reports/${reportId}/create-record-correction-request/456`);
      expect(req.session.initiateRecordCorrectionRequestErrorKey).toBeUndefined();
      expect(req.session.checkedCheckboxIds).toBeUndefined();
    });
  });

  describe(`when a single checkbox in status ${FEE_RECORD_STATUS.TO_DO} is selected but has multiple fee records in checkbox id`, () => {
    const requestBody: PremiumPaymentsTableCheckboxSelectionsRequestBody = {
      'feeRecordIds-456,789-reportedPaymentsCurrency-GBP-status-TO_DO': 'on',
    };

    it(`should render problem with service page`, () => {
      // Arrange
      const requestSession = aRequestSession();
      const reportId = '123';
      const { req, res } = httpMocks.createMocks<PostInitiateRecordCorrectionRequest>({
        params: { reportId },
        session: requestSession,
        body: requestBody,
      });

      // Act
      postInitiateRecordCorrectionRequest(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toEqual({ user: requestSession.user });
    });
  });
});

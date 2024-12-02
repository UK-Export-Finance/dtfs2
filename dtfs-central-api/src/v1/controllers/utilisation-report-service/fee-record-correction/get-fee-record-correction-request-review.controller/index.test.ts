import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import {
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  TestApiError,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { aBank } from '../../../../../../test-helpers';
import { getFeeRecordCorrectionRequestReview, GetFeeRecordCorrectionRequestReviewRequest } from '.';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import * as BanksRepo from '../../../../../repositories/banks-repo';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');
jest.mock('../../../../../repositories/banks-repo');

describe('get-fee-record-correction-request-review.controller', () => {
  describe('getFeeRecordRequestReview', () => {
    const reportId = 3;
    const feeRecordId = 14;
    const userId = '123';

    const getHttpMocks = () =>
      httpMocks.createMocks<GetFeeRecordCorrectionRequestReviewRequest>({
        params: { reportId: reportId.toString(), feeRecordId: feeRecordId.toString(), userId },
      });

    const findFeeRecordSpy = jest.spyOn(FeeRecordRepo, 'findOneByIdAndReportIdWithReport');
    const findFormDataSpy = jest.spyOn(FeeRecordCorrectionTransientFormDataRepo, 'findByUserIdAndFeeRecordId');
    const findBankSpy = jest.spyOn(BanksRepo, 'getBankById');

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a ${HttpStatusCode.NotFound} when no form data is found for the fee record and user combination`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findFormDataSpy.mockResolvedValue(null);
      findFeeRecordSpy.mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().build()).build());
      findBankSpy.mockResolvedValue(aBank());

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedErrorMessage = `Failed to find fee record correction transient form data with userId: ${userId} and feeRecordId: ${feeRecordId}`;
      expect(res._getData()).toEqual(`Failed to get fee record correction request review: ${expectedErrorMessage}`);
      expect(findFormDataSpy).toHaveBeenCalledTimes(1);
      expect(findFormDataSpy).toHaveBeenCalledWith(userId, feeRecordId);
    });

    it(`should respond with a ${HttpStatusCode.NotFound} when the fee record cannot be found`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findFormDataSpy.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      findFeeRecordSpy.mockResolvedValue(null);
      findBankSpy.mockResolvedValue(aBank());

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedErrorMessage = `Failed to find fee record with id: ${feeRecordId} and reportId: ${reportId}`;
      expect(res._getData()).toEqual(`Failed to get fee record correction request review: ${expectedErrorMessage}`);
      expect(findFeeRecordSpy).toHaveBeenCalledTimes(1);
      expect(findFeeRecordSpy).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it(`should respond with a ${HttpStatusCode.NotFound} when the bank cannot be found`, async () => {
      // Arrange
      const bankId = '1234567';
      const { req, res } = getHttpMocks();

      findFormDataSpy.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      findFeeRecordSpy.mockResolvedValue(FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().withBankId(bankId).build()).build());
      findBankSpy.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedErrorMessage = `Failed to find bank with id: ${bankId}`;
      expect(res._getData()).toEqual(`Failed to get fee record correction request review: ${expectedErrorMessage}`);
      expect(findBankSpy).toHaveBeenCalledTimes(1);
      expect(findBankSpy).toHaveBeenCalledWith(bankId);
    });

    it(`should respond with a ${HttpStatusCode.Ok} and the correction request details`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();
      const bankId = '12356';

      const formData = new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
        .withFormData({
          reasons: [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT],
          additionalInfo: 'this is more info',
        })
        .build();
      const feeRecord = FeeRecordEntityMockBuilder.forReport(new UtilisationReportEntityMockBuilder().withBankId(bankId).build())
        .withFacilityId('0011223344')
        .withExporter('Test company')
        .build();
      const bank = {
        ...aBank(),
        id: bankId,
        name: 'Test bank',
        paymentOfficerTeam: {
          teamName: 'Barclays Payment Reporting Team',
          emails: ['payment-officer3@ukexportfinance.gov.uk', 'payment-officer4@ukexportfinance.gov.uk'],
        },
      };

      findFormDataSpy.mockResolvedValue(formData);
      findFeeRecordSpy.mockResolvedValue(feeRecord);
      findBankSpy.mockResolvedValue(bank);

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(findFormDataSpy).toHaveBeenCalledTimes(1);
      expect(findFormDataSpy).toHaveBeenCalledWith(userId, feeRecordId);
      expect(findFeeRecordSpy).toHaveBeenCalledTimes(1);
      expect(findFeeRecordSpy).toHaveBeenCalledWith(feeRecordId, reportId);
      expect(findBankSpy).toHaveBeenCalledTimes(1);
      expect(findBankSpy).toHaveBeenCalledWith(bankId);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(res._getData()).toEqual({
        bank: {
          id: bank.id,
          name: bank.name,
        },
        reportPeriod: feeRecord.report.reportPeriod,
        correctionRequestDetails: {
          facilityId: feeRecord.facilityId,
          exporter: feeRecord.exporter,
          reasons: formData.formData.reasons,
          additionalInfo: formData.formData.additionalInfo,
          contactEmailAddresses: bank.paymentOfficerTeam.emails,
        },
      });
    });

    it("should respond with the specific error status if fetching the review throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorStatus = HttpStatusCode.RequestTimeout;
      findFormDataSpy.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if saving the report throws an 'ApiError'", async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      const errorMessage = 'Some error message';
      findFormDataSpy.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction request review: ${errorMessage}`);
    });

    it(`should respond with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findFormDataSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const { req, res } = getHttpMocks();

      findFormDataSpy.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionRequestReview(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to get fee record correction request review');
    });
  });
});

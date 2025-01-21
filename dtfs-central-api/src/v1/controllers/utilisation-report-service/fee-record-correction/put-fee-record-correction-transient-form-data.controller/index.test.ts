import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  CURRENCY,
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntity,
  getMonetaryValueAsNumber,
  RECORD_CORRECTION_REASON,
  RecordCorrectionFormValueValidationErrors,
  REQUEST_PLATFORM_TYPE,
  TestApiError,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { putFeeRecordCorrectionTransientFormData, PutFeeRecordCorrectionTransientFormDataRequest } from '.';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { PutFeeRecordCorrectionTransientFormDataPayload } from '../../../../routes/middleware/payload-validation';

jest.mock('../../../../../repositories/fee-record-correction-repo');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('put-fee-record-correction-transient-form-data.controller', () => {
  describe('putFeeRecordCorrectionTransientFormData', () => {
    const bankId = '123';
    const correctionId = 1;

    const userId = new ObjectId().toString();

    const additionalComments = 'Some additional comments';
    const formData = { reportedCurrency: CURRENCY.EUR, reportedFee: '123.45', utilisation: '10,000.23', additionalComments };

    const validatedFormData = {
      utilisation: getMonetaryValueAsNumber(formData.utilisation),
      reportedCurrency: formData.reportedCurrency,
      reportedFee: getMonetaryValueAsNumber(formData.reportedFee),
      additionalComments,
    };

    const aValidRequestQuery = () => ({ bankId, correctionId: correctionId.toString() });

    const aValidRequestBody = (): PutFeeRecordCorrectionTransientFormDataPayload => ({
      user: { _id: userId },
      formData,
    });

    const mockFindCorrection = jest.fn();
    const mockSaveTransientFormData = jest.fn();

    let req: PutFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordCorrectionRepo.findByIdAndBankId = mockFindCorrection;

      FeeRecordCorrectionTransientFormDataRepo.save = mockSaveTransientFormData;

      req = httpMocks.createRequest<PutFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call the correction repo to fetch the correction', async () => {
      // Arrange
      mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().build());

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockFindCorrection).toHaveBeenCalledTimes(1);
      expect(mockFindCorrection).toHaveBeenCalledWith(correctionId, bankId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no correction with the provided id and bank id is found`, async () => {
      // Arrange
      mockFindCorrection.mockResolvedValue(null);

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(mockSaveTransientFormData).not.toHaveBeenCalled();
    });

    describe('when there are form validation errors', () => {
      it(`should respond with a '${HttpStatusCode.Ok}' and the validation errors in the body`, async () => {
        // Arrange
        const correctionReasons = [
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().withReasons(correctionReasons).build());

        req.body.formData = {
          reportedCurrency: CURRENCY.GBP,
          reportedFee: '1abc',
          utilisation: 'invalid',
        };

        // Act
        await putFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

        const expectedValidationErrors: RecordCorrectionFormValueValidationErrors = {
          reportedFeeErrorMessage: 'You must enter the reported fee in a valid format',
          utilisationErrorMessage: 'You must enter the utilisation in a valid format',
          additionalCommentsErrorMessage: 'You must enter a comment',
        };
        const expectedResponse = {
          validationErrors: expectedValidationErrors,
        };

        expect(res._getData()).toEqual(expectedResponse);
      });

      it('should not call the correction repo to save the form data', async () => {
        // Arrange
        mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().build());

        // Act
        await putFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(mockSaveTransientFormData).not.toHaveBeenCalled();
      });
    });

    describe('when there are no form validation errors', () => {
      it(`should respond with a '${HttpStatusCode.Ok}' if the transient form data is saved successfully`, async () => {
        // Arrange
        const correctionReasons = [
          RECORD_CORRECTION_REASON.UTILISATION_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_CURRENCY_INCORRECT,
          RECORD_CORRECTION_REASON.REPORTED_FEE_INCORRECT,
          RECORD_CORRECTION_REASON.OTHER,
        ];

        mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().withReasons(correctionReasons).build());

        const expectedTransientFormDataEntity = FeeRecordCorrectionTransientFormDataEntity.create({
          userId,
          correctionId,
          formData: validatedFormData,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.PORTAL,
            userId,
          },
        });

        // Act
        await putFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

        expect(mockSaveTransientFormData).toHaveBeenCalledTimes(1);
        expect(mockSaveTransientFormData).toHaveBeenCalledWith(expectedTransientFormDataEntity);
      });

      it(`should respond with no validation errors in the response body`, async () => {
        // Arrange
        const correctionReasons = [RECORD_CORRECTION_REASON.OTHER];

        mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().withReasons(correctionReasons).build());

        req.body.formData = { additionalComments };

        // Act
        await putFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        const expectedResponse = {
          validationErrors: {},
        };

        expect(res._getData()).toEqual(expectedResponse);
      });
    });

    it("should respond with the specific error status if an 'ApiError' is thrown", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockFindCorrection.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
      expect(mockSaveTransientFormData).not.toHaveBeenCalled();
    });

    it("should respond with the specific error message if an 'ApiError' is thrown", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFindCorrection.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction transient form data: ${errorMessage}`);
      expect(mockSaveTransientFormData).not.toHaveBeenCalled();
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFindCorrection.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);

      expect(mockSaveTransientFormData).not.toHaveBeenCalled();
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFindCorrection.mockRejectedValue(new Error('Some error'));

      // Act
      await putFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to put fee record correction transient form data`);

      expect(mockSaveTransientFormData).not.toHaveBeenCalled();
    });
  });
});

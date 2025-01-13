import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionTransientFormDataEntity,
  RecordCorrectionTransientFormData,
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

    const formData = { utilisation: '12345' };

    // TODO FN-3688 PR 2: Remove the "as unknown as RecordCorrectionTransientFormData".
    const validatedFormData = formData as unknown as RecordCorrectionTransientFormData;

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

    it(`should respond with a '${HttpStatusCode.Ok}' if the transient form data is saved successfully`, async () => {
      // Arrange
      mockFindCorrection.mockResolvedValue(new FeeRecordCorrectionEntityMockBuilder().build());
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

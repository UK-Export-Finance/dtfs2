import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
  TestApiError,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { GetFeeRecordCorrectionTransientFormDataRequest, GetFeeRecordCorrectionTransientFormDataResponse, getFeeRecordCorrectionTransientFormData } from '.';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('get-fee-record-correction-transient-form-data.controller', () => {
  describe('getFeeRecordCorrectionTransientFormData', () => {
    const reportId = 1;
    const feeRecordId = 2;

    const tfmUserId = new ObjectId().toString();

    const aValidRequestQuery = () => ({ reportId: reportId.toString(), feeRecordId: feeRecordId.toString(), userId: tfmUserId });

    const mockFeeRecordExists = jest.fn();
    const mockTransientFormDataFind = jest.fn();

    let req: GetFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordRepo.existsByIdAndReportId = mockFeeRecordExists;
      FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndFeeRecordId = mockTransientFormDataFind;

      req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the retrieved form data if a transient form data entity exists`, async () => {
      // Arrange
      const formData: RecordCorrectionTransientFormData = {
        reasons: [RECORD_CORRECTION_REASON.OTHER],
        additionalInfo: 'Some additional information',
      };
      const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withFormData(formData).build();

      mockFeeRecordExists.mockReturnValue(true);
      mockTransientFormDataFind.mockResolvedValue(transientFormDataEntity);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual(formData);

      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and an empty form data object if a fee record exists but a transient form data entity does not exist`, async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);
      mockTransientFormDataFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual({});

      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it('should call fee record exists once', async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
    });

    it('should call fee record exists with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it('should call fee record correction transient form data find once if a fee record exists', async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
    });

    it('should call fee record correction transient form data find with the correct parameters if a fee record exists', async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no fee record with the provided fee record id and report id is found`, async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(false);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });

    it("should respond with the specific error status if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordExists.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFeeRecordExists.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data`);
    });
  });
});

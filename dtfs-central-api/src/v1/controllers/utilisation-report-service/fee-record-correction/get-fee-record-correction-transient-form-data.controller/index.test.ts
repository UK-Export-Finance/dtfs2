import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import {
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
  TestApiError,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
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

    beforeEach(() => {
      FeeRecordRepo.existsByIdAndReportId = mockFeeRecordExists;
      mockFeeRecordExists.mockReturnValue(true);

      FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndFeeRecordId = mockTransientFormDataFind;
      mockTransientFormDataFind.mockResolvedValue(null);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the retrieved form data if a transient form data entity exists`, async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      const formData: RecordCorrectionTransientFormData = {
        reasons: [RECORD_CORRECTION_REASON.OTHER],
        additionalInfo: 'Some additional information',
      };
      const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withFormData(formData).build();

      mockTransientFormDataFind.mockResolvedValue(transientFormDataEntity);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual(formData);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and an empty form data object if a fee record exists but a transient form data entity does not exist`, async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      mockTransientFormDataFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual({});

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no fee record with the provided fee record id and report id is found`, async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockReturnValue(false);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });

    it("responds with the specific error status if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordExists.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });

    it("responds with the specific error message if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      mockFeeRecordExists.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data: ${errorMessage}`);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      const res = httpMocks.createResponse();

      mockFeeRecordExists.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data`);

      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);

      expect(mockTransientFormDataFind).not.toHaveBeenCalled();
    });
  });
});

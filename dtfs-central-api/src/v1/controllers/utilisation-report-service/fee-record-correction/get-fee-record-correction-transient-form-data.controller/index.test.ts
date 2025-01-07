import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { FeeRecordCorrectionTransientFormDataEntityMockBuilder, RecordCorrectionTransientFormData, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { GetFeeRecordCorrectionTransientFormDataRequest, GetFeeRecordCorrectionTransientFormDataResponse, getFeeRecordCorrectionTransientFormData } from '.';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('get-fee-record-correction-transient-form-data.controller', () => {
  describe('getFeeRecordCorrectionTransientFormData', () => {
    const correctionId = 1;

    const portalUserId = new ObjectId().toString();

    const aValidRequestParams = () => ({ correctionId: correctionId.toString(), userId: portalUserId });

    const mockTransientFormDataFind = jest.fn();

    let req: GetFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndCorrectionId = mockTransientFormDataFind;

      req = httpMocks.createRequest<GetFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestParams(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should call the repo to fetch the transient form data for the user and correction combination', async () => {
      // Arrange
      mockTransientFormDataFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataFind).toHaveBeenCalledWith(portalUserId, correctionId);
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the retrieved form data if a transient form data entity exists`, async () => {
      // Arrange
      const formData: RecordCorrectionTransientFormData = {
        utilisation: 500000,
      };
      const transientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withFormData(formData).build();

      mockTransientFormDataFind.mockResolvedValue(transientFormDataEntity);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual(formData);
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and empty object if a transient form data entity does not exist`, async () => {
      // Arrange
      mockTransientFormDataFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionTransientFormDataResponse;
      expect(responseBody).toEqual({});
    });

    it("should respond with the specific error status if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockTransientFormDataFind.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the transient form data throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockTransientFormDataFind.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockTransientFormDataFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockTransientFormDataFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction transient form data`);
    });
  });
});

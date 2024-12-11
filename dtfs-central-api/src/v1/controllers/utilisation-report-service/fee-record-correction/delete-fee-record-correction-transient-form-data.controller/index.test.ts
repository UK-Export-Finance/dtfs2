import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { DeleteFeeRecordCorrectionTransientFormDataRequest, deleteFeeRecordCorrectionTransientFormData } from '.';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('delete-fee-record-correction-transient-form-data.controller', () => {
  describe('deleteFeeRecordCorrectionTransientFormData', () => {
    const reportId = 1;
    const feeRecordId = 2;

    const tfmUserId = new ObjectId().toString();

    const aValidRequestQuery = () => ({ reportId: reportId.toString(), feeRecordId: feeRecordId.toString(), userId: tfmUserId });

    const mockFeeRecordExists = jest.fn();
    const mockTransientFormDataDelete = jest.fn();

    let req: DeleteFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordRepo.existsByIdAndReportId = mockFeeRecordExists;
      FeeRecordCorrectionTransientFormDataRepo.deleteByUserIdAndFeeRecordId = mockTransientFormDataDelete;

      req = httpMocks.createRequest<DeleteFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.NoContent}' if the associated fee record entity exists`, async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);
      mockTransientFormDataDelete.mockResolvedValue(null);

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NoContent);
    });

    it('should call fee record exists once', async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledTimes(1);
    });

    it('should call fee record exists with the correct parameters', async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockFeeRecordExists).toHaveBeenCalledWith(feeRecordId, reportId);
    });

    it('should call fee record correction transient form data delete once if a fee record exists', async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataDelete).toHaveBeenCalledTimes(1);
    });

    it('should call fee record correction transient form data delete with the correct parameters if a fee record exists', async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(true);

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataDelete).toHaveBeenCalledWith(tfmUserId, feeRecordId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no fee record with the provided fee record id and report id is found`, async () => {
      // Arrange
      mockFeeRecordExists.mockReturnValue(false);

      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      expect(mockTransientFormDataDelete).not.toHaveBeenCalled();
    });

    describe("when deleting the transient form data throws an 'ApiError'", () => {
      const errorStatus = HttpStatusCode.NotFound;
      const errorMessage = 'Some error message';

      beforeEach(() => {
        mockFeeRecordExists.mockRejectedValue(new TestApiError({ status: errorStatus, message: errorMessage }));
      });

      it('should respond with the specific error status', async () => {
        // Act
        await deleteFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(errorStatus);
      });

      it('should respond with the specific error message', async () => {
        // Act
        await deleteFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getData()).toEqual(`Failed to delete fee record correction transient form data: ${errorMessage}`);
      });
    });

    describe('when an unknown error occurs', () => {
      beforeEach(() => {
        mockFeeRecordExists.mockRejectedValue(new Error('Some error'));
      });

      it(`should respond with a '${HttpStatusCode.InternalServerError}'`, async () => {
        // Act
        await deleteFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
      });

      it('should respond with a generic error message', async () => {
        // Act
        await deleteFeeRecordCorrectionTransientFormData(req, res);

        // Assert
        expect(res._getData()).toEqual(`Failed to delete fee record correction transient form data`);
      });
    });
  });
});

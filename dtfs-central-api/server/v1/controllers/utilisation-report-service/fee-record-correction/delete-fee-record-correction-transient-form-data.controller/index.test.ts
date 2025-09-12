import { TestApiError } from '@ukef/dtfs2-common/test-helpers';
import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { DeleteFeeRecordCorrectionTransientFormDataRequest, deleteFeeRecordCorrectionTransientFormData } from '.';

jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('../../../../../repositories/fee-record-correction-request-transient-form-data-repo');

console.error = jest.fn();

describe('delete-fee-record-correction-request-transient-form-data.controller', () => {
  describe('deleteFeeRecordCorrectionRequestTransientFormData', () => {
    const correctionId = 1;

    const portalUserId = new ObjectId().toString();

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), userId: portalUserId });

    const mockTransientFormDataDelete = jest.fn();

    let req: DeleteFeeRecordCorrectionTransientFormDataRequest;
    let res: MockResponse<Response>;

    beforeEach(() => {
      FeeRecordCorrectionTransientFormDataRepo.deleteByUserIdAndCorrectionId = mockTransientFormDataDelete;

      req = httpMocks.createRequest<DeleteFeeRecordCorrectionTransientFormDataRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.NoContent}' on success`, async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NoContent);
    });

    it('should call fee record correction transient form data repo to delete the data', async () => {
      // Act
      await deleteFeeRecordCorrectionTransientFormData(req, res);

      // Assert
      expect(mockTransientFormDataDelete).toHaveBeenCalledTimes(1);
      expect(mockTransientFormDataDelete).toHaveBeenCalledWith(portalUserId, correctionId);
    });

    describe("when deleting the transient form data throws an 'ApiError'", () => {
      const errorStatus = HttpStatusCode.NotFound;
      const errorMessage = 'Some error message';

      beforeEach(() => {
        mockTransientFormDataDelete.mockRejectedValue(new TestApiError({ status: errorStatus, message: errorMessage }));
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
        mockTransientFormDataDelete.mockRejectedValue(new Error('Some error'));
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

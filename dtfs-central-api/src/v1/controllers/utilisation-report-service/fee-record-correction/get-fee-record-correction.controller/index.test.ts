import httpMocks, { MockResponse } from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { FeeRecordCorrectionEntityMockBuilder, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { GetFeeRecordCorrectionRequest, GetFeeRecordCorrectionResponse, getFeeRecordCorrection } from '.';
import { mapFeeRecordCorrectionEntityToResponse } from './helpers';

jest.mock('../../../../../repositories/fee-record-correction-repo');

console.error = jest.fn();

describe('get-fee-record-correction.controller', () => {
  describe('getFeeRecordCorrection', () => {
    const correctionId = 7;

    const tfmUserId = new ObjectId().toString();

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), userId: tfmUserId });

    const mockFeeRecordCorrectionFind = jest.fn();

    let req: GetFeeRecordCorrectionRequest;
    let res: MockResponse<GetFeeRecordCorrectionResponse>;

    beforeEach(() => {
      FeeRecordCorrectionRepo.findOneByIdWithFeeRecordAndReport = mockFeeRecordCorrectionFind;

      req = httpMocks.createRequest<GetFeeRecordCorrectionRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the mapped fee record correction if a fee record correction entity exists`, async () => {
      // Arrange
      const feeRecordCorrectionEntity = new FeeRecordCorrectionEntityMockBuilder().build();

      mockFeeRecordCorrectionFind.mockResolvedValue(feeRecordCorrectionEntity);

      const expectedMappedFeeRecordCorrection = mapFeeRecordCorrectionEntityToResponse(feeRecordCorrectionEntity);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetFeeRecordCorrectionResponse;
      expect(responseBody).toEqual(expectedMappedFeeRecordCorrection);

      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledTimes(1);
      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledWith(correctionId);
    });

    it('should call fee record correction find once', async () => {
      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledTimes(1);
    });

    it('should call fee record correction find with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledWith(correctionId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no fee record correction with the provided fee record correction id is found`, async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it("should respond with the specific error status if retrieving the fee record correction throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordCorrectionFind.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the fee record correction throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFeeRecordCorrectionFind.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction`);
    });
  });
});

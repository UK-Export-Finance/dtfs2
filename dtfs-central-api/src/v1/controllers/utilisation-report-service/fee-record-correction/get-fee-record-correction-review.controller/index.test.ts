import httpMocks, { MockResponse } from 'node-mocks-http';
import { TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { GetFeeRecordCorrectionReviewRequest, GetFeeRecordCorrectionReviewResponse, getFeeRecordCorrectionReview } from '.';

jest.mock('../../../../../repositories/fee-record-correction-repo');

console.error = jest.fn();

describe('get-fee-record-correction-review.controller', () => {
  describe('getFeeRecordCorrectionReview', () => {
    const correctionId = 7;
    const userId = 'abc123';

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), userId });

    const mockFeeRecordCorrectionFind = jest.fn();

    let req: GetFeeRecordCorrectionReviewRequest;
    let res: MockResponse<GetFeeRecordCorrectionReviewResponse>;

    beforeEach(() => {
      FeeRecordCorrectionRepo.findOneByIdWithFeeRecord = mockFeeRecordCorrectionFind;

      req = httpMocks.createRequest<GetFeeRecordCorrectionReviewRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    // TODO FN-3669: The following test case requires the persistence work to be merged in to this branch - complete before initial review

    // it(`should respond with a '${HttpStatusCode.Ok}' and the mapped fee record correction review details if a fee record correction entity exists`, async () => {
    //   // Arrange
    //   const transientFormData = {};

    //   const feeRecordCorrectionEntity = new FeeRecordCorrectionEntityMockBuilder().build();

    //   mockFeeRecordCorrectionFind.mockResolvedValue(feeRecordCorrectionEntity);

    //   const expectedMappedFeeRecordCorrectionInformation = mapTransientCorrectionDataToReviewInformation(transientFormData, feeRecordCorrectionEntity);

    //   // Act
    //   await getFeeRecordCorrectionReview(req, res);

    //   // Assert
    //   expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

    //   const responseBody = res._getData() as FeeRecordCorrectionReviewInformation;
    //   expect(responseBody).toEqual(expectedMappedFeeRecordCorrectionInformation);
    // });

    it('should call fee record correction find once', async () => {
      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledTimes(1);
    });

    it('should call fee record correction find with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(mockFeeRecordCorrectionFind).toHaveBeenCalledWith(correctionId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if fee record correction with the provided fee record correction id is not found`, async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it("should respond with the specific error status if retrieving the fee record correction review information throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockFeeRecordCorrectionFind.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the fee record correction review information throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockFeeRecordCorrectionFind.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction review information: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockFeeRecordCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction review information`);
    });
  });
});

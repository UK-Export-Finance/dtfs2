import httpMocks, { MockResponse } from 'node-mocks-http';
import {
  FeeRecordCorrectionEntityMockBuilder,
  FeeRecordCorrectionReviewInformation,
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  RecordCorrectionTransientFormData,
  TestApiError,
} from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import { GetFeeRecordCorrectionReviewRequest, GetFeeRecordCorrectionReviewResponse, getFeeRecordCorrectionReview } from '.';
import { mapTransientCorrectionDataToReviewInformation } from './helpers';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';

jest.mock('../../../../../repositories/fee-record-correction-repo');

console.error = jest.fn();

describe('get-fee-record-correction-review.controller', () => {
  describe('getFeeRecordCorrectionReview', () => {
    const correctionId = 7;
    const userId = 'abc123';

    const aValidRequestQuery = () => ({ correctionId: correctionId.toString(), userId });

    const mockCorrectionFind = jest.fn();
    const mockCorrectionTransientFormDataFind = jest.fn();

    let req: GetFeeRecordCorrectionReviewRequest;
    let res: MockResponse<GetFeeRecordCorrectionReviewResponse>;

    beforeEach(() => {
      FeeRecordCorrectionRepo.findOneByIdWithFeeRecord = mockCorrectionFind;
      FeeRecordCorrectionTransientFormDataRepo.findByUserIdAndCorrectionId = mockCorrectionTransientFormDataFind;

      mockCorrectionTransientFormDataFind.mockResolvedValue({});

      req = httpMocks.createRequest<GetFeeRecordCorrectionReviewRequest>({
        params: aValidRequestQuery(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the mapped fee record correction review details if a fee record correction entity exists`, async () => {
      // Arrange
      const correctionReasons = [RECORD_CORRECTION_REASON.UTILISATION_INCORRECT, RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];
      const transientFormData: RecordCorrectionTransientFormData = {
        utilisation: 10000.23,
        facilityId: '99999999',
        additionalComments: null,
      };

      const correctionTransientFormDataEntity = new FeeRecordCorrectionTransientFormDataEntityMockBuilder().withFormData(transientFormData).build();

      mockCorrectionTransientFormDataFind.mockResolvedValue(correctionTransientFormDataEntity);

      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).withReasons(correctionReasons).build();

      mockCorrectionFind.mockResolvedValue(feeRecordCorrectionEntity);

      const expectedMappedFeeRecordCorrectionInformation = mapTransientCorrectionDataToReviewInformation(transientFormData, feeRecordCorrectionEntity);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as FeeRecordCorrectionReviewInformation;
      expect(responseBody).toEqual(expectedMappedFeeRecordCorrectionInformation);
    });

    it('should call fee record correction transient form data find once with the correct parameters', async () => {
      // Arrange
      const feeRecordCorrectionEntity = FeeRecordCorrectionEntityMockBuilder.forIsCompleted(false).build();

      mockCorrectionFind.mockResolvedValue(feeRecordCorrectionEntity);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(mockCorrectionTransientFormDataFind).toHaveBeenCalledTimes(1);
      expect(mockCorrectionTransientFormDataFind).toHaveBeenCalledWith(userId, correctionId);
    });

    it('should call fee record correction find once with the correct parameters', async () => {
      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(mockCorrectionFind).toHaveBeenCalledTimes(1);
      expect(mockCorrectionFind).toHaveBeenCalledWith(correctionId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if fee record correction with the provided fee record correction id is not found`, async () => {
      // Arrange
      mockCorrectionFind.mockResolvedValue(null);

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it("should respond with the specific error status if retrieving the fee record correction review information throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockCorrectionFind.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the fee record correction review information throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockCorrectionFind.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction review information: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockCorrectionFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getFeeRecordCorrectionReview(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get fee record correction review information`);
    });
  });
});

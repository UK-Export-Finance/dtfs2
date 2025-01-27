import httpMocks, { MockResponse } from 'node-mocks-http';
import { FeeRecordCorrectionEntityMockBuilder, TestApiError } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionRepo } from '../../../../../repositories/fee-record-correction-repo';
import {
  getCompletedFeeRecordCorrections,
  GetCompletedFeeRecordCorrectionsRequest,
  GetCompletedFeeRecordCorrectionsResponse,
  GetCompletedFeeRecordCorrectionsResponseBody,
} from '.';
import { mapCompletedFeeRecordCorrectionsToResponse } from './helpers';

jest.mock('../../../../../repositories/fee-record-correction-repo');

console.error = jest.fn();

describe('get-completed-fee-record-corrections.controller', () => {
  describe('getCompletedFeeRecordCorrections', () => {
    const bankId = '123';

    const aValidRequestParams = () => ({ bankId });

    const mockCompletedCorrectionsFind = jest.fn();

    let req: GetCompletedFeeRecordCorrectionsRequest;
    let res: MockResponse<GetCompletedFeeRecordCorrectionsResponse>;

    beforeEach(() => {
      FeeRecordCorrectionRepo.findCompletedCorrectionsByBankIdWithFeeRecord = mockCompletedCorrectionsFind;

      req = httpMocks.createRequest<GetCompletedFeeRecordCorrectionsRequest>({
        params: aValidRequestParams(),
      });
      res = httpMocks.createResponse();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it(`should respond with a '${HttpStatusCode.Ok}' and the mapped completed fee record corrections if completed correction entities exist`, async () => {
      // Arrange
      const completedCorrections = [
        FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).withId(1).build(),
        FeeRecordCorrectionEntityMockBuilder.forIsCompleted(true).withId(2).build(),
      ];

      mockCompletedCorrectionsFind.mockResolvedValue(completedCorrections);

      const expectedMappedCompletedCorrections = mapCompletedFeeRecordCorrectionsToResponse(completedCorrections);

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);

      const responseBody = res._getData() as GetCompletedFeeRecordCorrectionsResponseBody;
      expect(responseBody).toEqual(expectedMappedCompletedCorrections);
    });

    it('should call "completed fee record corrections" find method once with the correct parameters', async () => {
      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(mockCompletedCorrectionsFind).toHaveBeenCalledTimes(1);
      expect(mockCompletedCorrectionsFind).toHaveBeenCalledWith(bankId);
    });

    it(`should respond with a '${HttpStatusCode.NotFound}' if no completed fee record corrections with the provided bank id are found`, async () => {
      // Arrange
      mockCompletedCorrectionsFind.mockResolvedValue([]);

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
    });

    it("should respond with the specific error status if retrieving the completed fee record corrections throws an 'ApiError'", async () => {
      // Arrange
      const errorStatus = HttpStatusCode.NotFound;
      mockCompletedCorrectionsFind.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if retrieving the completed fee record corrections throws an 'ApiError'", async () => {
      // Arrange
      const errorMessage = 'Some error message';
      mockCompletedCorrectionsFind.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get completed fee record corrections: ${errorMessage}`);
    });

    it(`should respond with a '${HttpStatusCode.InternalServerError}' if an unknown error occurs`, async () => {
      // Arrange
      mockCompletedCorrectionsFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      mockCompletedCorrectionsFind.mockRejectedValue(new Error('Some error'));

      // Act
      await getCompletedFeeRecordCorrections(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to get completed fee record corrections`);
    });
  });
});

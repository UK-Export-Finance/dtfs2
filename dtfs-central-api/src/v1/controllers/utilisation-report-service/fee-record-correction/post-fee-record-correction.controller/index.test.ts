import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import { FeeRecordCorrectionTransientFormDataEntityMockBuilder, RECORD_CORRECTION_REASON, REQUEST_PLATFORM_TYPE, TestApiError } from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { postFeeRecordCorrection, PostFeeRecordCorrectionRequest } from './index';
import { aTfmSessionUser } from '../../../../../../test-helpers';
import { executeWithSqlTransaction } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../../../services/state-machines/fee-record/fee-record.state-machine';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FEE_RECORD_EVENT_TYPE } from '../../../../../services/state-machines/fee-record/event/fee-record.event-type';

jest.mock('../../../../../helpers');
jest.mock('../../../../../services/state-machines/fee-record/fee-record.state-machine');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');

console.error = jest.fn();

describe('post-fee-record-correction.controller', () => {
  describe('postFeeRecordCorrection', () => {
    const reportId = 1;
    const feeRecordId = 1;

    const mockFindByUserIdAndFeeRecordId = jest.fn();
    const mockEntityManager = {} as unknown as EntityManager;
    const mockHandleEvent = jest.fn();
    const mockForFeeRecordIdAndReportId = jest.fn();

    beforeEach(() => {
      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
      mockForFeeRecordIdAndReportId.mockReturnValue({
        handleEvent: mockHandleEvent,
      });
      FeeRecordStateMachine.forFeeRecordIdAndReportId = mockForFeeRecordIdAndReportId;

      jest.spyOn(FeeRecordCorrectionTransientFormDataRepo, 'withTransaction').mockReturnValue({ findByUserIdAndFeeRecordId: mockFindByUserIdAndFeeRecordId });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should request record correction', async () => {
      // Arrange
      const userId = new ObjectId().toString();
      const user = {
        ...aTfmSessionUser(),
        _id: userId,
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];
      const additionalInfo = 'here is my additional information';

      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(
        new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
          .withUserId(userId)
          .withFeeRecordId(feeRecordId)
          .withFormData({ reasons, additionalInfo })
          .build(),
      );

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(mockFindByUserIdAndFeeRecordId).toHaveBeenCalledWith(userId, feeRecordId);
      expect(mockForFeeRecordIdAndReportId).toHaveBeenCalledWith(feeRecordId, reportId);
      expect(mockHandleEvent).toHaveBeenCalledTimes(1);
      expect(mockHandleEvent).toHaveBeenCalledWith({
        type: FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED,
        payload: {
          transactionEntityManager: mockEntityManager,
          requestedByUser: {
            id: userId,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          reasons,
          additionalInfo,
          requestSource: {
            platform: REQUEST_PLATFORM_TYPE.TFM,
            userId,
          },
        },
      });
    });

    it("responds with a '200' if the record correction request is successful", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
    });

    it(`responds with ${HttpStatusCode.NotFound} if no form data can be found`, async () => {
      // Arrange
      const userId = new ObjectId().toString();
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: { ...aTfmSessionUser(), _id: userId } },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(null);

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);
      const expectedNotFoundMessage = `Failed to find record correction form data for user id: ${userId} and fee record id: ${feeRecordId}`;
      expect(res._getData()).toEqual(`Failed to create record correction: ${expectedNotFoundMessage}`);
    });

    it("responds with the specific error status if requesting the correction throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());

      const errorStatus = HttpStatusCode.NotFound;
      mockHandleEvent.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if requesting the correction throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());

      const errorMessage = 'Some error message';
      mockHandleEvent.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to create record correction: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser },
      });
      const res = httpMocks.createResponse();

      mockFindByUserIdAndFeeRecordId.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to create record correction');
    });
  });
});

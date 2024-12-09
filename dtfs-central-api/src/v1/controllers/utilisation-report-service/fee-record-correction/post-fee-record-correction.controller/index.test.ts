import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { HttpStatusCode } from 'axios';
import {
  FeeRecordCorrectionTransientFormDataEntityMockBuilder,
  FeeRecordEntityMockBuilder,
  RECORD_CORRECTION_REASON,
  REQUEST_PLATFORM_TYPE,
  TestApiError,
  UtilisationReportEntityMockBuilder,
} from '@ukef/dtfs2-common';
import { EntityManager } from 'typeorm';
import { postFeeRecordCorrection, PostFeeRecordCorrectionRequest } from './index';
import { aTfmSessionUser } from '../../../../../../test-helpers';
import { executeWithSqlTransaction } from '../../../../../helpers';
import { FeeRecordStateMachine } from '../../../../../services/state-machines/fee-record/fee-record.state-machine';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../../../../repositories/fee-record-correction-transient-form-data-repo';
import { FEE_RECORD_EVENT_TYPE } from '../../../../../services/state-machines/fee-record/event/fee-record.event-type';
import { FeeRecordRepo } from '../../../../../repositories/fee-record-repo';
import { sendFeeRecordCorrectionRequestEmails } from './helpers';

jest.mock('../../../../../helpers');
jest.mock('../../../../../services/state-machines/fee-record/fee-record.state-machine');
jest.mock('../../../../../repositories/fee-record-correction-transient-form-data-repo');
jest.mock('../../../../../repositories/fee-record-repo');
jest.mock('./helpers');

console.error = jest.fn();

describe('post-fee-record-correction.controller', () => {
  describe('postFeeRecordCorrection', () => {
    const reportId = 1;
    const feeRecordId = 1;

    const mockFindTransientFormData = jest.fn();
    const mockFindFeeRecordWithReport = jest.fn();
    const mockEntityManager = {} as EntityManager;
    const mockHandleEvent = jest.fn();
    const mockForFeeRecordStateMachineConstructor = jest.fn();

    beforeEach(() => {
      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
      mockForFeeRecordStateMachineConstructor.mockReturnValue({
        handleEvent: mockHandleEvent,
      });
      FeeRecordStateMachine.forFeeRecord = mockForFeeRecordStateMachineConstructor;

      jest.spyOn(FeeRecordCorrectionTransientFormDataRepo, 'withTransaction').mockReturnValue({ findByUserIdAndFeeRecordId: mockFindTransientFormData });
      jest.spyOn(FeeRecordRepo, 'withTransaction').mockReturnValue({ findOneByIdAndReportIdWithReport: mockFindFeeRecordWithReport });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('when the request is successful', () => {
      const userId = new ObjectId().toString();
      const user = {
        ...aTfmSessionUser(),
        _id: userId,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@test.com',
      };

      const reasons = [RECORD_CORRECTION_REASON.FACILITY_ID_INCORRECT];
      const additionalInfo = 'here is my additional information';

      const mockReport = new UtilisationReportEntityMockBuilder()
        .withReportPeriod({ start: { month: 1, year: 2023 }, end: { month: 3, year: 2023 } })
        .withBankId('123')
        .build();
      const mockFeeRecord = FeeRecordEntityMockBuilder.forReport(mockReport).withExporter('Test company').build();

      const getHttpMocks = () => {
        const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
          params: { reportId, feeRecordId },
          body: { user },
        });
        const res = httpMocks.createResponse();

        return { req, res };
      };

      beforeEach(() => {
        mockFindTransientFormData.mockResolvedValue(
          new FeeRecordCorrectionTransientFormDataEntityMockBuilder()
            .withUserId(userId)
            .withFeeRecordId(feeRecordId)
            .withFormData({ reasons, additionalInfo })
            .build(),
        );
        mockFindFeeRecordWithReport.mockResolvedValue(mockFeeRecord);
      });

      it('should retrieve the form data using the fee record id and user id', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postFeeRecordCorrection(req, res);

        // Assert
        expect(mockFindTransientFormData).toHaveBeenCalledTimes(1);
        expect(mockFindTransientFormData).toHaveBeenCalledWith(userId, feeRecordId);
      });

      it('should retrieve the fee record with report by fee record id and report id', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postFeeRecordCorrection(req, res);

        // Assert
        expect(mockFindFeeRecordWithReport).toHaveBeenCalledTimes(1);
        expect(mockFindFeeRecordWithReport).toHaveBeenCalledWith(feeRecordId, reportId);
      });

      it('should send the correction request emails', async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postFeeRecordCorrection(req, res);

        // Assert
        expect(sendFeeRecordCorrectionRequestEmails).toHaveBeenCalledTimes(1);
        expect(sendFeeRecordCorrectionRequestEmails).toHaveBeenCalledWith(
          reasons,
          mockReport.reportPeriod,
          mockFeeRecord.exporter,
          mockReport.bankId,
          user.email,
        );
      });

      it(`should call the fee record state machine with the ${FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED} event`, async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        const expectedEventPayload = {
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
        };

        // Act
        await postFeeRecordCorrection(req, res);

        // Assert
        expect(mockForFeeRecordStateMachineConstructor).toHaveBeenCalledTimes(1);
        expect(mockForFeeRecordStateMachineConstructor).toHaveBeenCalledWith(mockFeeRecord);
        expect(mockHandleEvent).toHaveBeenCalledTimes(1);
        expect(mockHandleEvent).toHaveBeenCalledWith({
          type: FEE_RECORD_EVENT_TYPE.CORRECTION_REQUESTED,
          payload: expectedEventPayload,
        });
      });

      it(`should respond with a '${HttpStatusCode.Ok}'`, async () => {
        // Arrange
        const { req, res } = getHttpMocks();

        // Act
        await postFeeRecordCorrection(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      });
    });

    it(`responds with ${HttpStatusCode.NotFound} if no form data can be found`, async () => {
      // Arrange
      const userId = new ObjectId().toString();
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: { ...aTfmSessionUser(), _id: userId } },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(null);

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);

      const expectedNotFoundMessage = `Failed to find record correction form data for user id: ${userId} and fee record id: ${feeRecordId}`;
      expect(res._getData()).toEqual(`Failed to create record correction: ${expectedNotFoundMessage}`);
    });

    it(`responds with ${HttpStatusCode.NotFound} if no fee record with given id and report id can be found`, async () => {
      // Arrange
      const userId = new ObjectId().toString();
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: { ...aTfmSessionUser(), _id: userId } },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      mockFindFeeRecordWithReport.mockResolvedValue(null);

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.NotFound);

      const expectedNotFoundMessage = `Failed to find a fee record with id ${feeRecordId} and report id ${reportId}`;
      expect(res._getData()).toEqual(`Failed to create record correction: ${expectedNotFoundMessage}`);
    });

    it("should respond with the specific error status if requesting the correction throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      mockFindFeeRecordWithReport.mockResolvedValue(new FeeRecordEntityMockBuilder().build());

      const errorStatus = HttpStatusCode.NotFound;
      mockHandleEvent.mockRejectedValue(new TestApiError({ status: errorStatus }));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("should respond with the specific error message if requesting the correction throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      mockFindFeeRecordWithReport.mockResolvedValue(new FeeRecordEntityMockBuilder().build());

      const errorMessage = 'Some error message';
      mockHandleEvent.mockRejectedValue(new TestApiError({ message: errorMessage }));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to create record correction: ${errorMessage}`);
    });

    it(`should respond with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser() },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      mockFindFeeRecordWithReport.mockResolvedValue(new FeeRecordEntityMockBuilder().build());

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('should respond with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PostFeeRecordCorrectionRequest>({
        params: { reportId, feeRecordId },
        body: { user: aTfmSessionUser },
      });
      const res = httpMocks.createResponse();

      mockFindTransientFormData.mockResolvedValue(new FeeRecordCorrectionTransientFormDataEntityMockBuilder().build());
      mockFindFeeRecordWithReport.mockResolvedValue(new FeeRecordEntityMockBuilder().build());

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await postFeeRecordCorrection(req, res);

      // Assert
      expect(res._getData()).toEqual('Failed to create record correction');
    });
  });
});

import httpMocks from 'node-mocks-http';
import { ObjectId } from 'mongodb';
import { FEE_RECORD_STATUS, FeeRecordEntityMockBuilder, TestApiError, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { EntityManager } from 'typeorm';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { executeWithSqlTransaction } from '../../../../helpers';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';
import { PutKeyingDataMarkToDoRequest, putKeyingDataMarkAsToDo } from '.';
import { PutKeyingDataMarkAsPayload } from '../../../routes/middleware/payload-validation';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';

jest.mock('../../../../helpers');
jest.mock('../../../../services/state-machines/utilisation-report/utilisation-report.state-machine');

console.error = jest.fn();

describe('put-keying-data-mark-as-to-do.controller', () => {
  describe('putKeyingDataMarkAsToDo', () => {
    const tfmUserId = new ObjectId().toString();

    const reportId = 1;
    const feeRecordId = 2;

    const aValidRequestQuery = () => ({ reportId: reportId.toString() });

    const aValidRequestBody = (): PutKeyingDataMarkAsPayload => ({
      user: { ...aTfmSessionUser(), _id: tfmUserId },
      feeRecordIds: [feeRecordId],
    });

    const feeRecordRepoFindByIdAndReportIdSpy = jest.spyOn(FeeRecordRepo, 'findByIdAndReportIdWithReport');

    const mockEntityManager = {} as unknown as EntityManager;
    const mockHandleEvent = jest.fn();
    const mockForReport = jest.fn();

    beforeEach(() => {
      jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => {
        await functionToExecute(mockEntityManager);
      });
      mockForReport.mockReturnValue({
        handleEvent: mockHandleEvent,
      });
      UtilisationReportStateMachine.forReport = mockForReport;
      const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();
      const feeRecord = FeeRecordEntityMockBuilder.forReport(report).withId(feeRecordId).withStatus(FEE_RECORD_STATUS.RECONCILED).build();
      feeRecordRepoFindByIdAndReportIdSpy.mockResolvedValue([feeRecord]);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("responds with the specific error status if marking keying data as to do throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PutKeyingDataMarkToDoRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorStatus = 404;
      mockHandleEvent.mockRejectedValue(new TestApiError(errorStatus, undefined));

      // Act
      await putKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(errorStatus);
    });

    it("responds with the specific error message if marking keying data throws an 'ApiError'", async () => {
      // Arrange
      const req = httpMocks.createRequest<PutKeyingDataMarkToDoRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      const errorMessage = 'Some error message';
      mockHandleEvent.mockRejectedValue(new TestApiError(undefined, errorMessage));

      // Act
      await putKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to mark keying data with fee record ids ${feeRecordId} from report with id ${reportId} as TO DO: ${errorMessage}`);
    });

    it(`responds with a ${HttpStatusCode.InternalServerError} if an unknown error occurs`, async () => {
      // Arrange
      const req = httpMocks.createRequest<PutKeyingDataMarkToDoRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await putKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.InternalServerError);
    });

    it('responds with a generic error message if an unknown error occurs', async () => {
      // Arrange
      const req = httpMocks.createRequest<PutKeyingDataMarkToDoRequest>({
        params: aValidRequestQuery(),
        body: aValidRequestBody(),
      });
      const res = httpMocks.createResponse();

      mockHandleEvent.mockRejectedValue(new Error('Some error'));

      // Act
      await putKeyingDataMarkAsToDo(req, res);

      // Assert
      expect(res._getData()).toEqual(`Failed to mark keying data with fee record ids ${feeRecordId} from report with id ${reportId} as TO DO`);
    });
  });
});

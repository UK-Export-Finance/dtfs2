import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { QueryRunner } from 'typeorm';
import { DbRequestSource, UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { PutUtilisationReportStatusRequest, putUtilisationReportStatus } from '.';
import { ReportWithStatus } from '../../../../types/utilisation-reports';
import { UtilisationReportStateMachine } from '../../../../services/state-machines/utilisation-report/utilisation-report.state-machine';

console.error = jest.fn();

describe('put-utilisation-report-status.controller', () => {
  const validReportsWithStatus: ReportWithStatus[] = [
    {
      reportId: 1,
      status: 'REPORT_NOT_RECEIVED',
    },
    {
      reportId: 2,
      status: 'PENDING_RECONCILIATION',
    },
    {
      reportId: 3,
      status: 'RECONCILIATION_COMPLETED',
    },
  ];

  const userId = '65eb429f2d9d7dec79149dd3';

  const validRequestBody = {
    user: {
      _id: userId,
    },
    reportsWithStatus: validReportsWithStatus,
  };

  const requestSource: DbRequestSource = {
    platform: 'TFM',
    userId,
  };

  const getHttpMocks = () =>
    httpMocks.createMocks<PutUtilisationReportStatusRequest>({
      body: { ...validRequestBody },
    });

  it.each`
    condition                    | invalidUserObject
    ${'user is undefined'}       | ${undefined}
    ${"'user._id' is undefined"} | ${{ _id: undefined }}
  `('throws an InvalidPayloadError if $condition', async ({ invalidUserObject }: { invalidUserObject?: { _id: undefined } }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body.user = invalidUserObject;

    // Act
    await putUtilisationReportStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual("Failed to update utilisation report statuses: Request body item 'user' supplied does not match required format");
  });

  it.each`
    condition                                         | invalidReportsWithStatus
    ${"'reportsWithStatus' is undefined"}             | ${undefined}
    ${"'reportsWithStatus[0].status' is undefined"}   | ${[{ reportId: 1, status: undefined }]}
    ${"'reportsWithStatus[0].reportId' is undefined"} | ${[{ reportId: undefined, status: 'PENDING_RECONCILIATION' }]}
  `('throws an InvalidPayloadError if $condition', async ({ invalidReportsWithStatus }: { invalidReportsWithStatus?: ReportWithStatus[] }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body.reportsWithStatus = invalidReportsWithStatus;

    // Act
    await putUtilisationReportStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(
      "Failed to update utilisation report statuses: Request body item 'reportsWithStatus' supplied does not match required format",
    );
  });

  const getReportIdToStateMachineMapFromReports = (reports: UtilisationReportEntity[]): { [reportId: number]: UtilisationReportStateMachine } =>
    reports.reduce(
      (map, report) => ({
        ...map,
        [report.id]: UtilisationReportStateMachine.forReport(report),
      }),
      {},
    );

  const mockRepository = {
    save: jest.fn(),
  };

  const mockConnect = jest.fn();
  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockRollbackTransaction = jest.fn();
  const mockRelease = jest.fn();

  const mockTransactionManager = {
    getRepository: jest.fn(),
  };

  const mockQueryRunner = {
    connect: mockConnect,
    startTransaction: mockStartTransaction,
    commitTransaction: mockCommitTransaction,
    rollbackTransaction: mockRollbackTransaction,
    release: mockRelease,
    manager: mockTransactionManager,
  } as unknown as QueryRunner;

  describe('when trying to only mark reports as completed', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(mockTransactionManager.getRepository).mockReturnValue(mockRepository);
    });

    it('tries to update the correct reports', async () => {
      // Arrange
      const reportsWithStatusForMarkingAsCompleted: ReportWithStatus[] = [
        {
          reportId: 1,
          status: 'RECONCILIATION_COMPLETED',
        },
        {
          reportId: 2,
          status: 'RECONCILIATION_COMPLETED',
        },
      ];

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = reportsWithStatusForMarkingAsCompleted;

      const existingReports = [
        UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').withId(reportsWithStatusForMarkingAsCompleted[0].reportId).build(),
        UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportsWithStatusForMarkingAsCompleted[1].reportId).build(),
      ];

      const reportIdToStateMachineMap = getReportIdToStateMachineMapFromReports(existingReports);

      jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockImplementation((reportId) => Promise.resolve(reportIdToStateMachineMap[reportId]));

      const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

      // Act
      await putUtilisationReportStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(createQueryRunnerSpy).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockStartTransaction).toHaveBeenCalledTimes(1);
      expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
      expect(mockRollbackTransaction).not.toHaveBeenCalled();
      expect(mockRelease).toHaveBeenCalled();
      expect(mockTransactionManager.getRepository).toHaveBeenCalledWith(UtilisationReportEntity);
      expect(mockRepository.save).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsCompleted.length);

      existingReports.forEach((report) => {
        report.updateWithStatus({ status: 'RECONCILIATION_COMPLETED', requestSource });
        expect(mockRepository.save).toHaveBeenCalledWith(report);
      });
    });

    it('responds with an error if trying to mark an already completed report as completed', async () => {
      // Arrange
      const reportWithStatus: ReportWithStatus = {
        reportId: 1,
        status: 'RECONCILIATION_COMPLETED',
      };

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = [reportWithStatus];

      const existingReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withId(reportWithStatus.reportId).build();

      const existingReportStateMachine = UtilisationReportStateMachine.forReport(existingReport);
      jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockImplementation(() => Promise.resolve(existingReportStateMachine));

      const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

      // Act
      await putUtilisationReportStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
      expect(res._getData()).toEqual('Failed to update utilisation report statuses: Transaction failed');
      expect(createQueryRunnerSpy).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockStartTransaction).toHaveBeenCalledTimes(1);
      expect(mockCommitTransaction).not.toHaveBeenCalled();
      expect(mockRollbackTransaction).toHaveBeenCalledTimes(1);
      expect(mockRelease).toHaveBeenCalled();
      expect(mockTransactionManager.getRepository).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when trying to only mark reports as not completed', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.mocked(mockTransactionManager.getRepository).mockReturnValue(mockRepository);
    });

    it('tries to update the correct reports', async () => {
      // Arrange
      const reportsWithStatusForMarkingAsNotCompleted: ReportWithStatus[] = [
        {
          reportId: 1,
          status: 'PENDING_RECONCILIATION',
        },
        {
          reportId: 2,
          status: 'REPORT_NOT_RECEIVED',
        },
        {
          reportId: 3,
          status: 'REPORT_NOT_RECEIVED',
        },
      ];

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = reportsWithStatusForMarkingAsNotCompleted;

      const existingReports = [
        UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED')
          .withId(reportsWithStatusForMarkingAsNotCompleted[0].reportId)
          .withAzureFileInfo(undefined)
          .build(),
        UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED')
          .withId(reportsWithStatusForMarkingAsNotCompleted[1].reportId)
          .withAzureFileInfo(undefined)
          .build(),
        UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withId(reportsWithStatusForMarkingAsNotCompleted[2].reportId).build(),
      ];

      const reportIdToStateMachineMap = getReportIdToStateMachineMapFromReports(existingReports);

      jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockImplementation((reportId) => Promise.resolve(reportIdToStateMachineMap[reportId]));

      const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

      // Act
      await putUtilisationReportStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toBe(HttpStatusCode.Ok);
      expect(createQueryRunnerSpy).toHaveBeenCalledTimes(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockStartTransaction).toHaveBeenCalledTimes(1);
      expect(mockCommitTransaction).toHaveBeenCalledTimes(1);
      expect(mockRollbackTransaction).not.toHaveBeenCalled();
      expect(mockRelease).toHaveBeenCalled();
      expect(mockTransactionManager.getRepository).toHaveBeenCalledWith(UtilisationReportEntity);
      expect(mockRepository.save).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsNotCompleted.length);

      existingReports.forEach((report, index) => {
        const expectedStatus = reportsWithStatusForMarkingAsNotCompleted[index].status;
        report.updateWithStatus({ status: expectedStatus, requestSource });
        expect(mockRepository.save).toHaveBeenCalledWith(report);
      });
    });

    it.each([UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION, UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED])(
      "responds with an error if trying to mark a report with status '%s' as not completed",
      async (reportStatus) => {
        // Arrange
        const reportWithStatus: ReportWithStatus = {
          reportId: 1,
          status: 'REPORT_NOT_RECEIVED',
        };

        const { req, res } = getHttpMocks();
        req.body.reportsWithStatus = [reportWithStatus];

        const existingReport = UtilisationReportEntityMockBuilder.forStatus(reportStatus).withId(reportWithStatus.reportId).build();

        const existingReportStateMachine = UtilisationReportStateMachine.forReport(existingReport);
        jest.spyOn(UtilisationReportStateMachine, 'forReportId').mockImplementation(() => Promise.resolve(existingReportStateMachine));

        const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner').mockReturnValue(mockQueryRunner);

        // Act
        await putUtilisationReportStatus(req, res);

        // Assert
        expect(res._getStatusCode()).toBe(HttpStatusCode.InternalServerError);
        expect(res._getData()).toEqual('Failed to update utilisation report statuses: Transaction failed');
        expect(createQueryRunnerSpy).toHaveBeenCalledTimes(1);
        expect(mockConnect).toHaveBeenCalledTimes(1);
        expect(mockStartTransaction).toHaveBeenCalledTimes(1);
        expect(mockCommitTransaction).not.toHaveBeenCalled();
        expect(mockRollbackTransaction).toHaveBeenCalledTimes(1);
        expect(mockRelease).toHaveBeenCalled();
        expect(mockTransactionManager.getRepository).not.toHaveBeenCalled();
        expect(mockRepository.save).not.toHaveBeenCalled();
      },
    );
  });
});

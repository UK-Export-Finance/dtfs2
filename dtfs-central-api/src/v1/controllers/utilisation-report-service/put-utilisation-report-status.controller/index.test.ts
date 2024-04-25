import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { QueryRunner, FindOptionsWhere } from 'typeorm';
import {
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  UTILISATION_REPORT_RECONCILIATION_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  ReportWithStatus,
} from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { PutUtilisationReportStatusRequest, putUtilisationReportStatus } from '.';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';

console.error = jest.fn();

describe('put-utilisation-report-status.controller', () => {
  const userId = '65eb429f2d9d7dec79149dd3';

  const validRequestBody = {
    user: {
      _id: userId,
    },
    reportsWithStatus: [],
  };

  const getHttpMocks = () =>
    httpMocks.createMocks<PutUtilisationReportStatusRequest>({
      body: { ...validRequestBody },
    });

  const mockConnect = jest.fn();
  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockRollbackTransaction = jest.fn();
  const mockRelease = jest.fn();

  const mockTransactionManager = {
    save: jest.fn(),
  };

  const mockQueryRunner = {
    connect: mockConnect,
    startTransaction: mockStartTransaction,
    commitTransaction: mockCommitTransaction,
    rollbackTransaction: mockRollbackTransaction,
    release: mockRelease,
    manager: mockTransactionManager,
  } as unknown as QueryRunner;

  const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner');

  const utilisationReportRepoFindOneByOrFailSpy = jest.spyOn(UtilisationReportRepo, 'findOneByOrFail');

  const mockFindOneByOrFail = (reports: UtilisationReportEntity[]) => (where: Parameters<typeof UtilisationReportRepo.findOneByOrFail>[0]) => {
    const reportWithMatchingId = reports.find(({ id: reportId }) => reportId === (where as FindOptionsWhere<UtilisationReportEntity>).id);
    if (!reportWithMatchingId) {
      throw new Error('Failed to find a report with the matching id');
    }
    return Promise.resolve(reportWithMatchingId);
  };

  beforeEach(() => {
    jest.resetAllMocks();
    createQueryRunnerSpy.mockReturnValue(mockQueryRunner);
  });

  it.each`
    condition                             | invalidUserObject
    ${"'req.body.user' is undefined"}     | ${undefined}
    ${"'req.body.user._id' is undefined"} | ${{ _id: undefined }}
  `('responds with an InvalidPayloadError if $condition', async ({ invalidUserObject }: { invalidUserObject?: { _id: undefined } }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body.user = invalidUserObject;

    // Act
    await putUtilisationReportStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual("Failed to update utilisation report statuses: Request body item 'user' supplied does not match required format");
    expect(createQueryRunnerSpy).not.toHaveBeenCalled();
  });

  it.each`
    condition                                                  | invalidReportsWithStatus
    ${"'req.body.reportsWithStatus' is undefined"}             | ${undefined}
    ${"'req.body.reportsWithStatus[0].status' is undefined"}   | ${[{ reportId: 1, status: undefined }]}
    ${"'req.body.reportsWithStatus[0].reportId' is undefined"} | ${[{ reportId: undefined, status: 'PENDING_RECONCILIATION' }]}
  `('responds with an InvalidPayloadError if $condition', async ({ invalidReportsWithStatus }: { invalidReportsWithStatus?: ReportWithStatus[] }) => {
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
    expect(createQueryRunnerSpy).not.toHaveBeenCalled();
  });

  describe('when trying to only mark reports as completed', () => {
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

      const existingReports = reportsWithStatusForMarkingAsCompleted.map(({ reportId }) =>
        UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).build(),
      );

      utilisationReportRepoFindOneByOrFailSpy.mockImplementation(mockFindOneByOrFail(existingReports));

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
      expect(mockTransactionManager.save).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsCompleted.length);

      existingReports.forEach((report) => {
        expect(report.status).toBe(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED);
        expect(report.lastUpdatedByIsSystemUser).toBe(false);
        expect(report.lastUpdatedByPortalUserId).toBeNull();
        expect(report.lastUpdatedByTfmUserId).toBe(userId);
        expect(mockTransactionManager.save).toHaveBeenCalledWith(UtilisationReportEntity, report);
      });
    });

    it.each([UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED, UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED])(
      "responds with an error if trying to mark a report with status '%s' as completed",
      async (reportStatus) => {
        // Arrange
        const reportWithStatus: ReportWithStatus = {
          reportId: 1,
          status: 'RECONCILIATION_COMPLETED',
        };

        const { req, res } = getHttpMocks();
        req.body.reportsWithStatus = [reportWithStatus];

        const existingReport = UtilisationReportEntityMockBuilder.forStatus(reportStatus).withId(reportWithStatus.reportId).build();

        utilisationReportRepoFindOneByOrFailSpy.mockResolvedValue(existingReport);

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
        expect(mockTransactionManager.save).not.toHaveBeenCalled();
      },
    );
  });

  describe('when trying to only mark reports as not completed', () => {
    it('tries to update the correct reports', async () => {
      // Arrange
      const reportsWithStatusForMarkingAsNotCompleted: ReportWithStatus[] = [
        {
          reportId: 1,
          status: 'PENDING_RECONCILIATION',
        },
        {
          reportId: 2,
          status: 'PENDING_RECONCILIATION',
        },
      ];

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = reportsWithStatusForMarkingAsNotCompleted;

      const azureFileInfo = AzureFileInfoEntity.create({
        ...MOCK_AZURE_FILE_INFO,
        requestSource: {
          platform: 'PORTAL',
          userId: 'abc123',
        },
      });

      const existingReports = reportsWithStatusForMarkingAsNotCompleted.map((reportWithStatus) =>
        UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').withId(reportWithStatus.reportId).withAzureFileInfo(azureFileInfo).build(),
      );

      utilisationReportRepoFindOneByOrFailSpy.mockImplementation(mockFindOneByOrFail(existingReports));

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
      expect(mockTransactionManager.save).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsNotCompleted.length);

      existingReports.forEach((report, index) => {
        const expectedStatus = reportsWithStatusForMarkingAsNotCompleted[index].status;
        expect(report.status).toBe(expectedStatus);
        expect(report.lastUpdatedByIsSystemUser).toBe(false);
        expect(report.lastUpdatedByPortalUserId).toBeNull();
        expect(report.lastUpdatedByTfmUserId).toBe(userId);
        expect(mockTransactionManager.save).toHaveBeenCalledWith(UtilisationReportEntity, report);
      });
    });

    it.each([UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION, UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED])(
      "responds with an error if trying to mark a report with status '%s' as not completed",
      async (reportStatus) => {
        // Arrange
        const reportWithStatus: ReportWithStatus = {
          reportId: 1,
          status: 'PENDING_RECONCILIATION',
        };

        const { req, res } = getHttpMocks();
        req.body.reportsWithStatus = [reportWithStatus];

        const existingReport = UtilisationReportEntityMockBuilder.forStatus(reportStatus).withId(reportWithStatus.reportId).build();

        utilisationReportRepoFindOneByOrFailSpy.mockResolvedValue(existingReport);

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
        expect(mockTransactionManager.save).not.toHaveBeenCalled();
      },
    );
  });
});

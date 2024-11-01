import { HttpStatusCode } from 'axios';
import httpMocks from 'node-mocks-http';
import { FindOptionsWhere, EntityManager } from 'typeorm';
import {
  AzureFileInfoEntity,
  MOCK_AZURE_FILE_INFO,
  UTILISATION_REPORT_STATUS,
  UtilisationReportEntity,
  UtilisationReportEntityMockBuilder,
  ReportWithStatus,
  REQUEST_PLATFORM_TYPE,
} from '@ukef/dtfs2-common';
import { PutUtilisationReportStatusRequest, putUtilisationReportStatus } from '.';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { executeWithSqlTransaction } from '../../../../helpers';

jest.mock('../../../../helpers');

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

  const utilisationReportRepoFindOneBySpy = jest.spyOn(UtilisationReportRepo, 'findOneBy');

  const mockFindOneBy = (reports: UtilisationReportEntity[]) => (where: Parameters<typeof UtilisationReportRepo.findOneBy>[0]) => {
    const reportWithMatchingId = reports.find(({ id: reportId }) => reportId === (where as FindOptionsWhere<UtilisationReportEntity>).id);
    return Promise.resolve(reportWithMatchingId ?? null);
  };

  const mockSave = jest.fn();
  const mockEntityManager = {
    save: mockSave,
  } as unknown as EntityManager;

  beforeEach(() => {
    jest.resetAllMocks();

    jest.mocked(executeWithSqlTransaction).mockImplementation(async (functionToExecute) => await functionToExecute(mockEntityManager));
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
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual("Failed to update utilisation report statuses: Request body item 'user' supplied does not match required format");
    expect(executeWithSqlTransaction).not.toHaveBeenCalled();
  });

  it.each`
    condition                                                  | invalidReportsWithStatus
    ${"'req.body.reportsWithStatus' is undefined"}             | ${undefined}
    ${"'req.body.reportsWithStatus[0].status' is undefined"}   | ${[{ reportId: 1, status: undefined }]}
    ${"'req.body.reportsWithStatus[0].reportId' is undefined"} | ${[{ reportId: undefined, status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION }]}
  `('responds with an InvalidPayloadError if $condition', async ({ invalidReportsWithStatus }: { invalidReportsWithStatus?: ReportWithStatus[] }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body.reportsWithStatus = invalidReportsWithStatus;

    // Act
    await putUtilisationReportStatus(req, res);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._getData()).toEqual(
      "Failed to update utilisation report statuses: Request body item 'reportsWithStatus' supplied does not match required format",
    );
    expect(executeWithSqlTransaction).not.toHaveBeenCalled();
  });

  describe('when trying to only mark reports as completed', () => {
    it('tries to update the correct reports', async () => {
      // Arrange
      const reportsWithStatusForMarkingAsCompleted: ReportWithStatus[] = [
        {
          reportId: 1,
          status: UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED,
        },
        {
          reportId: 2,
          status: UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED,
        },
      ];

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = reportsWithStatusForMarkingAsCompleted;

      const existingReports = reportsWithStatusForMarkingAsCompleted.map(({ reportId }) =>
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION).withId(reportId).build(),
      );

      utilisationReportRepoFindOneBySpy.mockImplementation(mockFindOneBy(existingReports));

      // Act
      await putUtilisationReportStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(mockSave).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsCompleted.length);

      existingReports.forEach((report) => {
        expect(report.status).toEqual(UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED);
        expect(report.lastUpdatedByIsSystemUser).toEqual(false);
        expect(report.lastUpdatedByPortalUserId).toBeNull();
        expect(report.lastUpdatedByTfmUserId).toEqual(userId);
        expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
      });
    });

    it.each([UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED, UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED])(
      "responds with an error if trying to mark a report with status '%s' as completed",
      async (reportStatus) => {
        // Arrange
        const reportWithStatus: ReportWithStatus = {
          reportId: 1,
          status: UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED,
        };

        const { req, res } = getHttpMocks();
        req.body.reportsWithStatus = [reportWithStatus];

        const existingReport = UtilisationReportEntityMockBuilder.forStatus(reportStatus).withId(reportWithStatus.reportId).build();

        utilisationReportRepoFindOneBySpy.mockResolvedValue(existingReport);

        // Act
        await putUtilisationReportStatus(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
        expect(res._getData()).toEqual(
          `Failed to update utilisation report statuses: Event type 'MANUALLY_SET_COMPLETED' is invalid for 'UtilisationReportEntity' (ID: '${reportWithStatus.reportId}') in state '${reportStatus}'`,
        );
        expect(mockSave).not.toHaveBeenCalled();
      },
    );
  });

  describe('when trying to only mark reports as not completed', () => {
    it('tries to update the correct reports', async () => {
      // Arrange
      const reportsWithStatusForMarkingAsNotCompleted: ReportWithStatus[] = [
        {
          reportId: 1,
          status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION,
        },
        {
          reportId: 2,
          status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION,
        },
      ];

      const { req, res } = getHttpMocks();
      req.body.reportsWithStatus = reportsWithStatusForMarkingAsNotCompleted;

      const azureFileInfo = AzureFileInfoEntity.create({
        ...MOCK_AZURE_FILE_INFO,
        requestSource: {
          platform: REQUEST_PLATFORM_TYPE.PORTAL,
          userId: 'abc123',
        },
      });

      const existingReports = reportsWithStatusForMarkingAsNotCompleted.map((reportWithStatus) =>
        UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_STATUS.RECONCILIATION_COMPLETED)
          .withId(reportWithStatus.reportId)
          .withAzureFileInfo(azureFileInfo)
          .build(),
      );

      utilisationReportRepoFindOneBySpy.mockImplementation(mockFindOneBy(existingReports));

      // Act
      await putUtilisationReportStatus(req, res);

      // Assert
      expect(res._getStatusCode()).toEqual(HttpStatusCode.Ok);
      expect(mockSave).toHaveBeenCalledTimes(reportsWithStatusForMarkingAsNotCompleted.length);

      existingReports.forEach((report, index) => {
        const expectedStatus = reportsWithStatusForMarkingAsNotCompleted[index].status;
        expect(report.status).toEqual(expectedStatus);
        expect(report.lastUpdatedByIsSystemUser).toEqual(false);
        expect(report.lastUpdatedByPortalUserId).toBeNull();
        expect(report.lastUpdatedByTfmUserId).toEqual(userId);
        expect(mockSave).toHaveBeenCalledWith(UtilisationReportEntity, report);
      });
    });

    it.each([UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION, UTILISATION_REPORT_STATUS.REPORT_NOT_RECEIVED])(
      "responds with an error if trying to mark a report with status '%s' as not completed",
      async (reportStatus) => {
        // Arrange
        const reportWithStatus: ReportWithStatus = {
          reportId: 1,
          status: UTILISATION_REPORT_STATUS.PENDING_RECONCILIATION,
        };

        const { req, res } = getHttpMocks();
        req.body.reportsWithStatus = [reportWithStatus];

        const existingReport = UtilisationReportEntityMockBuilder.forStatus(reportStatus).withId(reportWithStatus.reportId).build();

        utilisationReportRepoFindOneBySpy.mockResolvedValue(existingReport);

        // Act
        await putUtilisationReportStatus(req, res);

        // Assert
        expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
        expect(res._getData()).toEqual(
          `Failed to update utilisation report statuses: Event type 'MANUALLY_SET_INCOMPLETE' is invalid for 'UtilisationReportEntity' (ID: '${reportWithStatus.reportId}') in state '${reportStatus}'`,
        );
        expect(mockSave).not.toHaveBeenCalled();
      },
    );
  });
});

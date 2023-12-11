import { Collection } from 'mongodb';
import wipeDB from '../../wipeDB';
import app from '../../../src/createApp';
import createApi from '../../api';
import db from '../../../src/drivers/db-client';
import { MOCK_UTILISATION_REPORT } from '../../mocks/utilisation-reports';
import { DB_COLLECTIONS } from '../../../src/constants/dbCollections';
import { ReportDetails, ReportId } from '../../../src/types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants';

const api = createApi(app);

console.error = jest.fn();

describe('/v1/tfm/utilisation-reports/set-status', () => {
  const uploadedReportIds: ReportId[] = [];
  const uploadedReportDetails: ReportDetails[] = [];
  let utilisationReportsCollection: Collection;

  const mockUtilisationReports = [
    { ...MOCK_UTILISATION_REPORT, month: 1, year: 2023 },
    { ...MOCK_UTILISATION_REPORT, month: 2, year: 2023 },
    { ...MOCK_UTILISATION_REPORT, month: 3, year: 2023 },
  ];

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    for (const mockUtilisationReport of mockUtilisationReports) {
      try {
        const insertedDocument = await utilisationReportsCollection.insertOne(mockUtilisationReport);
        uploadedReportIds.push({
          id: insertedDocument.insertedId.toString(),
        });
        uploadedReportDetails.push({
          month: mockUtilisationReport.month,
          year: mockUtilisationReport.year,
          bankId: mockUtilisationReport.bank.id,
        });
      } catch (error) {
        throw new Error('Failed to insert mock utilisation reports:', error ?? 'unknown error');
      }
    }
  });

  beforeEach(async () => {
    const filterToResetAllStatuses = {};
    utilisationReportsCollection.updateMany(filterToResetAllStatuses, {
      $unset: {
        status: '',
      },
    });
  });

  it('returns a 400 error if the request body does not have the correct format', async () => {
    // Arrange
    const reportWithoutBankId = { month: 2, year: 2023 };
    const requestBody = {
      reportsWithStatus: [
        {
          report: reportWithoutBankId,
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');

    // Assert
    expect(status).toBe(400);
  });

  it('returns a 400 error if all elements of the request body except one have the correct format', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;
    const reportsWithStatus = uploadedReportIds.map((report) => ({
      report,
      status: reportStatus,
    }));
    const requestBody = {
      reportsWithStatus: [
        ...reportsWithStatus,
        {
          status: 'INVALID_STATUS',
        },
      ],
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');

    // Assert
    expect(status).toBe(400);
  });

  it('returns a 204 if the request body only uses report ids', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;
    const reportsWithStatus = uploadedReportIds.map((report) => ({
      report,
      status: reportStatus,
    }));
    const requestBody = {
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map((reportWithStatus) => utilisationReportsCollection.findOne({ _id: reportWithStatus.report.id })),
    );

    // Assert
    expect(status).toBe(204);
    updatedDocuments.forEach((document) => expect(document?.status).toEqual(reportStatus));
  });

  it('returns a 204 if the request body only uses the report month, year and bank id', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED;
    const reportsWithStatus = uploadedReportDetails.map((report) => ({
      report,
      status: reportStatus,
    }));
    const requestBody = {
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map(({ report }) =>
        utilisationReportsCollection.findOne({
          month: report.month,
          year: report.year,
          'bank.id': report.bankId,
        })),
    );

    // Assert
    expect(status).toBe(204);
    updatedDocuments.forEach((document) => expect(document?.status).toEqual(reportStatus));
  });

  it('returns a 204 if the request body has a combination of report identifiers', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
    const reportWithStatusWithBankId = {
      report: uploadedReportDetails[0],
      status: reportStatus,
    };
    const reportWithStatusWithReportId = {
      report: uploadedReportIds[1],
      status: reportStatus,
    };
    const reportsWithStatus = [reportWithStatusWithBankId, reportWithStatusWithReportId];
    const requestBody = {
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');
    const updatedDocuments = await Promise.all([
      utilisationReportsCollection.findOne({
        month: reportWithStatusWithBankId.report.month,
        year: reportWithStatusWithBankId.report.year,
        'bank.id': reportWithStatusWithBankId.report.bankId,
      }),
      utilisationReportsCollection.findOne({ _id: reportWithStatusWithReportId.report.id }),
    ]);

    // Assert
    expect(status).toBe(204);
    updatedDocuments.forEach((document) => expect(document?.status).toEqual(reportStatus));
  });

  describe('when the queried report does not already exist', () => {
    it(`creates a new report with undefined azureFileInfo if the status to set is ${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}`, async () => {
      // Arrange
      const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
      const report = {
        month: 4,
        year: 2023,
        bankId: uploadedReportDetails[0].bankId,
      };
      const reportWithStatus = {
        report,
        status: reportStatus,
      };
      const requestBody = {
        reportsWithStatus: [reportWithStatus],
      };
      const filter = {
        month: report.month,
        year: report.year,
        'bank.id': report.bankId,
      };

      // Act
      const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');
      const updatedDocument = await utilisationReportsCollection.findOne(filter);

      // Assert
      expect(status).toBe(204);
      expect(updatedDocument).not.toBeNull();
      expect(updatedDocument?.azureFileInfo).toBeNull();
    });

    it(`deletes a report if azureFileInfo is undefined and the status to set is ${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}`, async () => {
      // Arrange
      const report = {
        month: 5,
        year: 2023,
        bankId: uploadedReportDetails[0].bankId,
      };
      const reportWithStatus = {
        report,
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
      };
      const requestBodyToCreateDocument = {
        reportsWithStatus: [reportWithStatus],
      };
      await api.put(requestBodyToCreateDocument).to('/v1/tfm/utilisation-reports/set-status');
      const requestBodyToDeleteDocument = {
        reportsWithStatus: [
          {
            ...reportWithStatus,
            status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
          },
        ],
      };
      const filter = {
        month: report.month,
        year: report.year,
        'bank.id': report.bankId,
      };

      // Act
      const originalDocument = await utilisationReportsCollection.findOne(filter);
      const { status } = await api.put(requestBodyToDeleteDocument).to('/v1/tfm/utilisation-reports/set-status');
      const updatedDocument = await utilisationReportsCollection.findOne(filter);

      // Assert
      expect(originalDocument).not.toBeNull();
      expect(status).toBe(204);
      expect(updatedDocument).toBeNull();
    });
  });
});

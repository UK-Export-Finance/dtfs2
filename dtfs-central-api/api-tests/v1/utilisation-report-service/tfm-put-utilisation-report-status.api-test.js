const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const api = require('../../api')(app);
const db = require('../../../src/drivers/db-client');
const { mockUtilisationReports } = require('../../mocks/utilisation-reports/index.ts');
const { DB_COLLECTIONS } = require('../../../src/constants/dbCollections');

const ReportStatus = {
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
};

describe('/v1/tfm/utilisation-reports/set-status', () => {
  const requestBodyBaseWithReportIds = [];
  const requestBodyBaseWithBankIds = [];
  let utilisationReportsCollection;

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS]);

    utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    for (const mockUtilisationReport of mockUtilisationReports) {
      await utilisationReportsCollection.insertOne(mockUtilisationReport, (error, insertedDocument) => {
        if (error) {
          throw new Error('Failed to insert mock utilisation reports:', error);
        }

        requestBodyBaseWithReportIds.push({
          report: { id: insertedDocument.insertedId },
        });
        requestBodyBaseWithBankIds.push({
          report: { month: mockUtilisationReport.month, year: mockUtilisationReport.year, bankId: mockUtilisationReport.bank.id },
        });
      });
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
    const requestBody = {
      reportsWithStatus: [
        {
          report: { month: 2, year: 2023 },
          status: 'PENDING_RECONCILIATION',
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
    const reportStatus = ReportStatus.REPORT_NOT_RECEIVED;
    /* eslint-disable arrow-body-style */
    const reportsWithStatus = requestBodyBaseWithReportIds.map(({ report }) => {
      return { report, status: reportStatus };
    });
    /* eslint-enable arrow-body-style */
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
    const reportStatus = ReportStatus.REPORT_NOT_RECEIVED;
    /* eslint-disable arrow-body-style */
    const reportsWithStatus = requestBodyBaseWithReportIds.map(({ report }) => {
      return { report, status: reportStatus };
    });
    /* eslint-enable arrow-body-style */
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
    updatedDocuments.forEach((document) => expect(document.status).toEqual(reportStatus));
  });

  it('returns a 204 if the request body only uses the report month, year and bank id', async () => {
    // Arrange
    const reportStatus = ReportStatus.REPORT_NOT_RECEIVED;
    /* eslint-disable arrow-body-style */
    const reportsWithStatus = requestBodyBaseWithBankIds.map(({ report }) => {
      return { report, status: reportStatus };
    });
    /* eslint-enable arrow-body-style */
    const requestBody = {
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to('/v1/tfm/utilisation-reports/set-status');
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map(({ report }) => utilisationReportsCollection.findOne({
        month: report.month,
        year: report.year,
        'bank.id': report.bankId,
      })),
    );

    // Assert
    expect(status).toBe(204);
    updatedDocuments.forEach((document) => expect(document.status).toEqual(reportStatus));
  });

  it('returns a 204 if the request body has a combination of report identifiers', async () => {
    // Arrange
    const reportStatus = ReportStatus.PENDING_RECONCILIATION;
    const reportWithStatusWithBankId = {
      ...requestBodyBaseWithBankIds[0],
      status: reportStatus,
    };
    const reportWithStatusWithReportId = {
      ...requestBodyBaseWithReportIds[1],
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
    updatedDocuments.forEach((document) => expect(document.status).toEqual(reportStatus));
  });

  describe('when the queried report does not already exist', () => {
    it(`creates a new report with undefined azureFileInfo if the status to set is ${ReportStatus.PENDING_RECONCILIATION}`, async () => {
      // Arrange
      const reportStatus = ReportStatus.PENDING_RECONCILIATION;
      const report = {
        month: 4,
        year: 2023,
        bankId: requestBodyBaseWithBankIds[0].report.bankId,
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
      expect(updatedDocument.azureFileInfo).toBeNull();
    });

    it(`deletes a report if azureFileInfo is undefined and the status to set is ${ReportStatus.REPORT_NOT_RECEIVED}`, async () => {
      // Arrange
      const report = {
        month: 5,
        year: 2023,
        bankId: requestBodyBaseWithBankIds[0].report.bankId,
      };
      const reportWithStatus = {
        report,
        status: ReportStatus.PENDING_RECONCILIATION,
      };
      const requestBodyToCreateDocument = {
        reportsWithStatus: [reportWithStatus],
      };
      await api.put(requestBodyToCreateDocument).to('/v1/tfm/utilisation-reports/set-status');
      const requestBodyToDeleteDocument = {
        reportsWithStatus: [
          {
            ...reportWithStatus,
            status: ReportStatus.REPORT_NOT_RECEIVED,
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

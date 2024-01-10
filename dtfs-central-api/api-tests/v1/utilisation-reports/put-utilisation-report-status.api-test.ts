import { Collection, ObjectId, OptionalId, WithoutId } from 'mongodb';
import wipeDB from '../../wipeDB';
import app from '../../../src/createApp';
import createApi from '../../api';
import db from '../../../src/drivers/db-client';
import { MOCK_UTILISATION_REPORT } from '../../mocks/utilisation-reports/utilisation-reports';
import { MOCK_TFM_USER } from '../../mocks/test-users/mock-tfm-user';
import { MOCK_BANKS } from '../../mocks/banks';
import { DB_COLLECTIONS } from '../../../src/constants/db-collections';
import { ReportDetails, ReportId } from '../../../src/types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants';
import { UtilisationReport } from '../../../src/types/db-models/utilisation-reports';
import { withoutMongoId } from '../../../src/helpers/mongodb';

const api = createApi(app);

console.error = jest.fn();

describe('/v1/utilisation-reports/set-status', () => {
  const setStatusUrl = '/v1/utilisation-reports/set-status';
  const uploadedReportIds: ReportId[] = [];
  const uploadedReportDetails: ReportDetails[] = [];
  let utilisationReportsCollection: Collection<WithoutId<UtilisationReport>> | undefined;

  const mockUtilisationReportWithoutId = withoutMongoId(MOCK_UTILISATION_REPORT);
  const mockUtilisationReports: OptionalId<UtilisationReport>[] = [
    {
      ...mockUtilisationReportWithoutId,
      month: 1,
      year: 2023,
    },
    {
      ...mockUtilisationReportWithoutId,
      month: 2,
      year: 2023,
    },
    {
      ...mockUtilisationReportWithoutId,
      month: 3,
      year: 2023,
    },
  ];

  beforeAll(async () => {
    await wipeDB.wipe([DB_COLLECTIONS.UTILISATION_REPORTS, DB_COLLECTIONS.BANKS]);

    utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    for (const mockUtilisationReport of mockUtilisationReports) {
      try {
        const { insertedId } = await utilisationReportsCollection.insertOne(mockUtilisationReport);
        uploadedReportIds.push({
          id: insertedId.toString(),
        });
        uploadedReportDetails.push({
          month: mockUtilisationReport.month,
          year: mockUtilisationReport.year,
          bankId: mockUtilisationReport.bank.id,
        });
      } catch (error) {
        console.error('Failed to insert mock utilisation reports');
        throw error;
      }
    }

    const banksCollection = await db.getCollection(DB_COLLECTIONS.BANKS);
    await banksCollection.insertOne(MOCK_BANKS.HSBC);
  });

  beforeEach(async () => {
    const filterToResetAllStatuses = {};
    await utilisationReportsCollection?.updateMany(filterToResetAllStatuses, {
      $unset: {
        status: '',
      },
    });
  });

  it("should return a 500 error when trying to set a non-existent report to 'REPORT_NOT_RECEIVED'", async () => {
    // Arrange
    const report = {
      id: MOCK_UTILISATION_REPORT._id.toString(),
    };
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          report,
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
        },
      ],
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(500);
  });

  it('returns a 400 error if the request body does not have the correct format', async () => {
    // Arrange
    const reportWithoutBankId = { month: 2, year: 2023 };
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          report: reportWithoutBankId,
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);

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
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        ...reportsWithStatus,
        {
          status: 'INVALID_STATUS',
        },
      ],
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(400);
  });

  it('returns a 200 if the request body only uses report ids', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    const reportsWithStatus = uploadedReportIds.map((report) => ({
      report,
      status: reportStatus,
    }));
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map((reportWithStatus) => utilisationReportsCollection?.findOne({ _id: new ObjectId(reportWithStatus.report.id) })),
    );

    // Assert
    expect(status).toBe(200);
    updatedDocuments.forEach((document) => expect(document?.status).toEqual(reportStatus));
  });

  it('returns a 200 if the request body only uses the report month, year and bank id', async () => {
    // Arrange
    const reportStatus = UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION;
    const reportsWithStatus = uploadedReportDetails.map((report) => ({
      report,
      status: reportStatus,
    }));
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map(({ report }) =>
        utilisationReportsCollection?.findOne({
          month: report.month,
          year: report.year,
          'bank.id': report.bankId,
        }),
      ),
    );

    // Assert
    expect(status).toBe(200);
    updatedDocuments.forEach((document) => expect(document?.status).toEqual(reportStatus));
  });

  it('returns a 200 if the request body has a combination of report identifiers', async () => {
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
      user: MOCK_TFM_USER,
      reportsWithStatus,
    };

    // Act
    const { status } = await api.put(requestBody).to(setStatusUrl);
    const updatedDocuments = await Promise.all([
      utilisationReportsCollection?.findOne({
        month: reportWithStatusWithBankId.report.month,
        year: reportWithStatusWithBankId.report.year,
        'bank.id': reportWithStatusWithBankId.report.bankId,
      }),
      utilisationReportsCollection?.findOne({ _id: new ObjectId(reportWithStatusWithReportId.report.id) }),
    ]);

    // Assert
    expect(status).toBe(200);
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
        user: MOCK_TFM_USER,
        reportsWithStatus: [reportWithStatus],
      };
      const filter = {
        month: report.month,
        year: report.year,
        'bank.id': report.bankId,
      };

      // Act
      const { status } = await api.put(requestBody).to(setStatusUrl);
      const updatedDocument = await utilisationReportsCollection?.findOne(filter);

      // Assert
      expect(status).toBe(200);
      expect(updatedDocument).not.toBeNull();
      expect(updatedDocument?.azureFileInfo).toBeNull();
    });

    it(`deletes a report if azureFileInfo is undefined and the status to set is ${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}`, async () => {
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
        user: MOCK_TFM_USER,
        reportsWithStatus: [reportWithStatus],
      };
      await api.put(requestBodyToCreateDocument).to(setStatusUrl);
      const requestBodyToDeleteDocument = {
        user: MOCK_TFM_USER,
        reportsWithStatus: [
          {
            ...reportWithStatus,
            status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
          },
        ],
      };
      const filter = {
        month: report.month,
        year: report.year,
        'bank.id': report.bankId,
      };

      // Act
      const originalDocument = await utilisationReportsCollection?.findOne(filter);
      const { status } = await api.put(requestBodyToDeleteDocument).to(setStatusUrl);
      const updatedDocument = await utilisationReportsCollection?.findOne(filter);

      // Assert
      expect(originalDocument).not.toBeNull();
      expect(status).toBe(200);
      expect(updatedDocument).toBeNull();
    });
  });
});

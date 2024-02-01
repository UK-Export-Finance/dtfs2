import { Collection, ObjectId, OptionalId, WithoutId } from 'mongodb';
import wipeDB from '../../wipeDB';
import app from '../../../src/createApp';
import createApi from '../../api';
import db from '../../../src/drivers/db-client';
import { MOCK_UTILISATION_REPORT } from '../../mocks/utilisation-reports/utilisation-reports';
import { MOCK_TFM_USER } from '../../mocks/test-users/mock-tfm-user';
import { MOCK_BANKS } from '../../mocks/banks';
import { DB_COLLECTIONS } from '../../../src/constants/db-collections';
import { ReportId } from '../../../src/types/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../src/constants';
import { UtilisationReport } from '../../../src/types/db-models/utilisation-reports';
import { withoutMongoId } from '../../../src/helpers/mongodb';

const api = createApi(app);

console.error = jest.fn();

describe('/v1/utilisation-reports/set-status', () => {
  const setStatusUrl = '/v1/utilisation-reports/set-status';
  const uploadedReportIds: ReportId[] = [];
  let utilisationReportsCollection: Collection<WithoutId<UtilisationReport>> | undefined;

  const mockUtilisationReportWithoutId = withoutMongoId(MOCK_UTILISATION_REPORT);
  const mockUtilisationReports: OptionalId<UtilisationReport>[] = [
    {
      ...mockUtilisationReportWithoutId,
      reportPeriod: {
        start: {
          month: 1,
          year: 2023,
        },
        end: {
          month: 1,
          year: 2023,
        },
      },
    },
    {
      ...mockUtilisationReportWithoutId,
      reportPeriod: {
        start: {
          month: 2,
          year: 2023,
        },
        end: {
          month: 2,
          year: 2023,
        },
      },
    },
    {
      ...mockUtilisationReportWithoutId,
      reportPeriod: {
        start: {
          month: 3,
          year: 2023,
        },
        end: {
          month: 3,
          year: 2023,
        },
      },
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

  it(`should return a 500 error when trying to set a non-existent report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED}'`, async () => {
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
    const reportWithoutId = {};
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          report: reportWithoutId,
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
    const updatedDocuments = await Promise.all(
      reportsWithStatus.map((reportWithStatus) => utilisationReportsCollection?.findOne({ _id: new ObjectId(reportWithStatus.report.id) })),
    );

    // Assert
    expect(status).toBe(400);
    expect(updatedDocuments.length).toBe(reportsWithStatus.length);
    updatedDocuments.forEach((document) => expect(document?.status).not.toEqual(reportStatus));
  });

  it('returns a 200 if the request body is valid', async () => {
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
});

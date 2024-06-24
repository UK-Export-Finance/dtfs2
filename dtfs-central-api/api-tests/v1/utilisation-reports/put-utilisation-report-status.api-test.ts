import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { TestApi } from '../../test-api';
import { MOCK_TFM_USER } from '../../mocks/test-users/mock-tfm-user';
import { SqlDbHelper } from '../../sql-db-helper';

console.error = jest.fn();

describe('/v1/utilisation-reports/set-status', () => {
  const setStatusUrl = '/v1/utilisation-reports/set-status';

  const reportId = 1;
  const mockReport = UtilisationReportEntityMockBuilder.forStatus('PENDING_RECONCILIATION').withId(reportId).build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.saveNewEntry('UtilisationReport', mockReport);
  });

  it(`should return a 404 error when trying to set a non-existent report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED}'`, async () => {
    // Arrange
    const invalidReportId = reportId + 1;
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          reportId: invalidReportId,
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await TestApi.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(404);
  });

  it("returns a 400 error if a request body item is missing the 'reportId' property", async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          // reportId: missing
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await TestApi.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(400);
  });

  it("returns a 400 error if a request body item is missing the 'status' property", async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          reportId: 1,
          // status: missing
        },
      ],
    };

    // Act
    const { status } = await TestApi.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(400);
  });

  it('returns a 200 if the request body is valid', async () => {
    // Arrange
    const requestBody = {
      user: MOCK_TFM_USER,
      reportsWithStatus: [
        {
          reportId,
          status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await TestApi.put(requestBody).to(setStatusUrl);

    // Assert
    expect(status).toBe(200);
  });
});

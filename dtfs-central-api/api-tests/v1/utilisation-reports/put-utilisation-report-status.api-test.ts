import { PENDING_RECONCILIATION, RECONCILIATION_COMPLETED, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { testApi } from '../../test-api';
import { aTfmSessionUser } from '../../../test-helpers';
import { SqlDbHelper } from '../../sql-db-helper';

console.error = jest.fn();

const BASE_URL = '/v1/utilisation-reports/set-status';

describe(`PUT ${BASE_URL}`, () => {
  const reportId = 1;
  const mockReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION).withId(reportId).build();

  beforeAll(async () => {
    await SqlDbHelper.initialize();

    await SqlDbHelper.deleteAllEntries('UtilisationReport');
    await SqlDbHelper.saveNewEntry('UtilisationReport', mockReport);
  });

  it(`should return a 404 error when trying to set a non-existent report to '${RECONCILIATION_COMPLETED}'`, async () => {
    // Arrange
    const invalidReportId = reportId + 1;
    const requestBody = {
      user: aTfmSessionUser(),
      reportsWithStatus: [
        {
          reportId: invalidReportId,
          status: RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(BASE_URL);

    // Assert
    expect(status).toEqual(404);
  });

  it("returns a 400 error if a request body item is missing the 'reportId' property", async () => {
    // Arrange
    const requestBody = {
      user: aTfmSessionUser(),
      reportsWithStatus: [
        {
          // reportId: missing
          status: RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(BASE_URL);

    // Assert
    expect(status).toEqual(400);
  });

  it("returns a 400 error if a request body item is missing the 'status' property", async () => {
    // Arrange
    const requestBody = {
      user: aTfmSessionUser(),
      reportsWithStatus: [
        {
          reportId: 1,
          // status: missing
        },
      ],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(BASE_URL);

    // Assert
    expect(status).toEqual(400);
  });

  it('returns a 200 if the request body is valid', async () => {
    // Arrange
    const requestBody = {
      user: aTfmSessionUser(),
      reportsWithStatus: [
        {
          reportId,
          status: RECONCILIATION_COMPLETED,
        },
      ],
    };

    // Act
    const { status } = await testApi.put(requestBody).to(BASE_URL);

    // Assert
    expect(status).toEqual(200);
  });
});

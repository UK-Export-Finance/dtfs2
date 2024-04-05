import { Response } from 'supertest';
import {
  FeeRecordEntityMockBuilder,
  MONGO_DB_COLLECTIONS,
  UtilisationReportEntityMockBuilder,
  getCurrentReportPeriodForBankSchedule,
  getSubmissionMonthForReportPeriodStart,
} from '@ukef/dtfs2-common';
import wipeDB from '../../wipeDB';
import app from '../../../src/createApp';
import { MOCK_BANKS } from '../../mocks/banks';
import createApi from '../../api';
import { SqlDbHelper } from '../../sql-db-helper';
import { UtilisationReportReconciliationSummary } from '../../../src/types/utilisation-reports';
import { withoutMongoId } from '../../../src/helpers/mongodb';

const api = createApi(app);

interface CustomResponse extends Response {
  body: UtilisationReportReconciliationSummary[];
}

describe('/v1/utilisation-reports/reconciliation-summary/:submissionMonth', () => {
  beforeAll(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.BANKS]);
    await api.post(withoutMongoId(MOCK_BANKS.BARCLAYS)).to('/v1/bank');

    await SqlDbHelper.initialize();
  });

  describe('GET /v1/utilisation-reports/reconciliation-summary/:submissionMonth', () => {
    it('returns a 200 response when the submissionMonth is a valid ISO month', async () => {
      // Arrange
      const submissionMonth = '2023-11';

      // Act
      const response: CustomResponse = await api.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

      // Assert
      expect(response.status).toEqual(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].submissionMonth).toBe(submissionMonth);
      expect(response.body[0].items).toHaveLength(0);
    });

    it('returns a 400 response when the submissionMonth is not a valid ISO month', async () => {
      // Arrange
      const submissionMonth = 'invalid';

      // Act
      const response: CustomResponse = await api.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

      // Assert
      expect(response.status).toEqual(400);
    });

    it('returns a 200 response with the correct number of associated fee records', async () => {
      // Arrange
      const reportPeriod = getCurrentReportPeriodForBankSchedule(MOCK_BANKS.BARCLAYS.utilisationReportPeriodSchedule);
      const submissionMonth = getSubmissionMonthForReportPeriodStart(reportPeriod.start);

      await SqlDbHelper.deleteAllEntries('UtilisationReport');

      const utilisationReport = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS')
        .withBankId(MOCK_BANKS.BARCLAYS.id)
        .withReportPeriod(reportPeriod)
        .build();
      await SqlDbHelper.saveNewEntry('UtilisationReport', utilisationReport);

      const feeRecords = [
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(1).build(),
        FeeRecordEntityMockBuilder.forReport(utilisationReport).withId(2).build(),
      ];
      await SqlDbHelper.saveNewEntries('FeeRecord', feeRecords);

      // Act
      const response: CustomResponse = await api.get(`/v1/utilisation-reports/reconciliation-summary/${submissionMonth}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].submissionMonth).toBe(submissionMonth);
      expect(response.body[0].items).toHaveLength(1);
      expect(response.body[0].items[0].totalFeesReported).toBe(feeRecords.length);
      expect(response.body[0].items[0].reportedFeesLeftToReconcile).toBe(feeRecords.length);
    });
  });
});

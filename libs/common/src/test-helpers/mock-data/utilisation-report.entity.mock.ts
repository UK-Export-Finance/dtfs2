import { UtilisationReportEntity } from '../../sql-db-entities';

export const MOCK_UTILISATION_REPORT_ENTITY: UtilisationReportEntity = UtilisationReportEntity.createNotReceived({
  bankId: '123',
  reportPeriod: {
    start: { month: 12, year: 2023 },
    end: { month: 1, year: 2024 },
  },
  requestSource: {
    platform: 'SYSTEM',
  },
});

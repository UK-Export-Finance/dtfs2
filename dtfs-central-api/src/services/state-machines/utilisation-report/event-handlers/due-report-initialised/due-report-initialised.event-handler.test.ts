import { handleUtilisationReportDueReportInitialisedEvent } from './due-report-initialised.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportDueReportInitialisedEvent', () => {
  const BANK_ID = '956';
  const REPORT_PERIOD = {
    start: { month: 12, year: 2023 },
    end: { month: 1, year: 2024 },
  };

  // TODO FN-1860 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() =>
      handleUtilisationReportDueReportInitialisedEvent({
        bankId: BANK_ID,
        reportPeriod: REPORT_PERIOD,
      }),
    ).toThrow(NotImplementedError);
  });
});

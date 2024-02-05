import { ReportPeriod } from '../../src/types/utilisation-reports';

export const MOCK_MONTHLY_REPORT_PERIOD: ReportPeriod = {
  start: {
    month: 11,
    year: 2023,
  },
  end: {
    month: 11,
    year: 2023,
  },
};

export const MOCK_QUARTERLY_REPORT_PERIOD: ReportPeriod = {
  start: {
    month: 3,
    year: 2023,
  },
  end: {
    month: 5,
    year: 2023,
  },
};

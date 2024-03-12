import { MonthAndYearPartialEntity, ReportPeriodPartialEntity } from "@ukef/dtfs2-common";

export const aReportPeriodPartialEntity = (): ReportPeriodPartialEntity => {
  const start = new MonthAndYearPartialEntity();
  start.month = 12;
  start.year = 1998;
  const end = new MonthAndYearPartialEntity();
  end.month = 1;
  end.year = 1999;
  const period = new ReportPeriodPartialEntity();
  period.start = start;
  period.end = end;
  return period;
};
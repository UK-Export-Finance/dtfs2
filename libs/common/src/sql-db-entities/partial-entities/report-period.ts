import { Column } from 'typeorm';
import { MonthAndYearPartial } from './month-and-year';

export class ReportPeriodPartial {
  @Column(() => MonthAndYearPartial)
  start!: MonthAndYearPartial;

  @Column(() => MonthAndYearPartial)
  end!: MonthAndYearPartial;
}

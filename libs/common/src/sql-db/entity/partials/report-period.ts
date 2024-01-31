import { Column } from 'typeorm';
import { MonthAndYear } from './month-and-year';

export class ReportPeriod {
  @Column(() => MonthAndYear)
  start!: MonthAndYear;

  @Column(() => MonthAndYear)
  end!: MonthAndYear;
}

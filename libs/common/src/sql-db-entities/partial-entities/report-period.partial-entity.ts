import { Column } from 'typeorm';
import { MonthAndYearPartialEntity } from './month-and-year.partial-entity';

export class ReportPeriodPartialEntity {
  /**
   * The start of the report period
   */
  @Column(() => MonthAndYearPartialEntity)
  start!: MonthAndYearPartialEntity;

  /**
   * The end of the report period
   */
  @Column(() => MonthAndYearPartialEntity)
  end!: MonthAndYearPartialEntity;
}

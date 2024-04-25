import { Column } from 'typeorm';
import { MonthAndYearPartialEntity } from './month-and-year.partial-entity';

export class ReportPeriodPartialEntity {
  @Column(() => MonthAndYearPartialEntity)
  start!: MonthAndYearPartialEntity;

  @Column(() => MonthAndYearPartialEntity)
  end!: MonthAndYearPartialEntity;
}

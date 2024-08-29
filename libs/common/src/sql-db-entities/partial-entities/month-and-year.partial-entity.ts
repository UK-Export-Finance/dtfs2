import { Column } from 'typeorm';

export class MonthAndYearPartialEntity {
  /**
   * The month
   */
  @Column()
  month!: number;

  /**
   * The year
   */
  @Column()
  year!: number;
}

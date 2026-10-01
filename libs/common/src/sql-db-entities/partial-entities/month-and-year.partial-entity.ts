import { Column } from 'typeorm';
import type { OneIndexedMonth } from '../../types';

export class MonthAndYearPartialEntity {
  /**
   * The month (one-indexed)
   */
  @Column({ type: 'int' })
  month!: OneIndexedMonth;

  /**
   * The year
   */
  @Column({ type: 'int' })
  year!: number;
}

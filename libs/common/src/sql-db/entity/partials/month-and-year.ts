import { Column } from 'typeorm';

export class MonthAndYearPartial {
  @Column()
  month!: number;

  @Column()
  year!: number;
}

import { Column } from 'typeorm';

export class MonthAndYearPartialEntity {
  @Column()
  month!: number;

  @Column()
  year!: number;
}

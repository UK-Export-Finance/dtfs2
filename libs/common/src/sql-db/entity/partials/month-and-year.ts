import { Column } from 'typeorm';

export class MonthAndYear {
  @Column()
  month!: number;

  @Column()
  year!: number;
}

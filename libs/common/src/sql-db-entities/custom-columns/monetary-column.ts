import { Column } from 'typeorm';

export const MonetaryColumn = (): PropertyDecorator =>
  Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
  });

import { Column } from 'typeorm';

export const ExchangeRateColumn = (): PropertyDecorator =>
  Column({
    type: 'decimal',
    precision: 14,
    scale: 8,
  });

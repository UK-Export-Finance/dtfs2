import { Column } from 'typeorm';

type MonetaryColumnOptions = {
  nullable?: boolean;
  defaultValue?: number;
};

export const MonetaryColumn = (options?: MonetaryColumnOptions): PropertyDecorator =>
  Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: options?.nullable,
    default: options?.defaultValue,
  });

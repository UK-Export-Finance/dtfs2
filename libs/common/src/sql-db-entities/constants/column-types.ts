import { ColumnOptions } from 'typeorm';

/**
 * The column type for columns which are a
 * currency number
 */
export const CURRENCY_NUMBER_COLUMN_OPTIONS: ColumnOptions = {
  type: 'decimal',
  precision: 14,
  scale: 2,
};

/**
 * The precision for columns which are a
 * currency exchange rate
 */
export const CURRENCY_EXCHANGE_RATE_COLUMN_OPTIONS: ColumnOptions = {
  type: 'decimal',
  precision: 14,
  scale: 8,
};

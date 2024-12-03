import { Column } from 'typeorm';

/**
 * Decorator which should be used for exchange rate columns in typeORM entities
 * @returns A property decorator
 * @example
 * ```ts
 * import { Entity } from 'typeorm';
 *
 * @Entity()
 * class ExampleEntity {
 *   @ExchangeRateColumn()
 *   public exchangeRate!: number;
 * }
 * ```
 */
export const ExchangeRateColumn = (): PropertyDecorator =>
  Column({
    type: 'decimal',
    precision: 14,
    scale: 8,
  });

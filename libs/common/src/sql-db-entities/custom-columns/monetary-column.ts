import { Column } from 'typeorm';

type MonetaryColumnOptions = {
  /**
   * Whether or not the column is nullable
   */
  nullable?: boolean;
  /**
   * The default value for the column
   */
  defaultValue?: number;
};

/**
 * Decorator which should be used for monetary columns in typeORM entities
 * @param options - The options for the column
 * @returns A property decorator
 * @example
 * ```ts
 * import { Entity } from 'typeorm';
 *
 * @Entity()
 * class ExampleEntity {
 *   @MonetaryColumn({ nullable: true })
 *   public amount!: number | null;
 * }
 * ```
 */
export const MonetaryColumn = (options?: MonetaryColumnOptions): PropertyDecorator =>
  Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: options?.nullable,
    default: options?.defaultValue,
  });

import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Currency } from '../../types';
import { AuditableBaseEntity } from '../base-entities';
import { MonetaryColumn } from '../custom-columns';

@Entity('PaymentMatchingTolerance')
export class PaymentMatchingToleranceEntity extends AuditableBaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * The currency the tolerance applies to
   */
  @Column({ type: 'nvarchar' })
  currency!: Currency;

  /**
   * The amount threshold of the tolerance
   */
  @MonetaryColumn({ defaultValue: 0 })
  threshold!: number;

  /**
   * The date the tolerance was set
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Whether the tolerance is the active tolerance for it's currency
   */
  @Column()
  isActive?: boolean;
}

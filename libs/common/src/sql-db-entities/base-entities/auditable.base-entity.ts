import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { DbAuditUpdatedByUserId } from '../helpers';

export abstract class AuditableBaseEntity {
  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;

  @Column()
  updatedByUserId!: DbAuditUpdatedByUserId;
}

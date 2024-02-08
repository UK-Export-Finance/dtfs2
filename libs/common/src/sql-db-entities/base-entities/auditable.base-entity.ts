import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AuditableBaseEntity {
  @CreateDateColumn()
  createdDate!: Date;

  @UpdateDateColumn()
  updatedDate!: Date;

  @Column()
  updatedByUserId!: string;
}

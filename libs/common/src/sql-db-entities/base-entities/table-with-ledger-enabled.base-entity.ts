import { Column } from 'typeorm';
import { AuditableBaseEntity } from './auditable.base-entity';

export abstract class TableWithLedgerEnabled extends AuditableBaseEntity {
  @Column({ type: 'bigint', nullable: false, insert: false, update: false })
  ledger_start_transaction_id?: undefined;

  @Column({ type: 'bigint', nullable: true, insert: false, update: false })
  ledger_end_transaction_id?: undefined;

  @Column({ type: 'bigint', nullable: false, insert: false, update: false })
  ledger_start_sequence_number?: undefined;

  @Column({ type: 'bigint', nullable: true, insert: false, update: false })
  ledger_end_sequence_number?: undefined;
}

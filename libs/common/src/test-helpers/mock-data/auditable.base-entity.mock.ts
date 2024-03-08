import { AuditableBaseEntity } from '../../sql-db-entities/base-entities';

export const MOCK_AUDITABLE_BASE_ENTITY: AuditableBaseEntity = {
  createdDate: new Date(),
  updatedDate: new Date(),
  updatedByUserId: 'SYSTEM',
};

import { AzureFileInfoEntity } from '../sql-db-entities/azure-file-info';
import { AuditableBaseEntity } from '../sql-db-entities/base-entities';

export type AzureFileInfo = Omit<AzureFileInfoEntity, keyof AuditableBaseEntity | 'id' | 'utilisationReport'>;

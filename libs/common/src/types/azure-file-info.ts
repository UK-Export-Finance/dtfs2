import { AzureFileInfoEntity } from '../sql-db-entities/azure-file-info';

export type AzureFileInfo = Pick<AzureFileInfoEntity, 'folder' | 'filename' | 'fullPath' | 'url' | 'mimetype'>;

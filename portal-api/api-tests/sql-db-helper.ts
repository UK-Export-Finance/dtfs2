import {
  AzureFileInfoEntity,
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionTransientFormDataEntity,
  FeeRecordEntity,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

const initialize = async () => {
  if (SqlDbDataSource.isInitialized) {
    return SqlDbDataSource;
  }
  return await SqlDbDataSource.initialize();
};

type SqlTableName = 'UtilisationReport' | 'FeeRecord' | 'FeeRecordCorrection' | 'AzureFileInfo' | 'FeeRecordCorrectionTransientFormData';

const deleteAllEntries = async (tableName: SqlTableName): Promise<void> => {
  switch (tableName) {
    case 'UtilisationReport':
      await SqlDbDataSource.createQueryBuilder().delete().from(UtilisationReportEntity).execute();
      return;
    case 'FeeRecord':
      await SqlDbDataSource.createQueryBuilder().delete().from(FeeRecordEntity).execute();
      return;
    case 'FeeRecordCorrection':
      await SqlDbDataSource.createQueryBuilder().delete().from(FeeRecordCorrectionEntity).execute();
      return;
    case 'AzureFileInfo':
      await SqlDbDataSource.createQueryBuilder().delete().from(AzureFileInfoEntity).execute();
      return;
    case 'FeeRecordCorrectionTransientFormData':
      await SqlDbDataSource.createQueryBuilder().delete().from(FeeRecordCorrectionTransientFormDataEntity).execute();
      return;
    default:
      throw new Error(`Cannot delete all entries from table: no entity found for table name '${tableName}'`);
  }
};

type Entity<TableName extends SqlTableName> = TableName extends 'UtilisationReport'
  ? UtilisationReportEntity
  : TableName extends 'FeeRecord'
  ? FeeRecordEntity
  : TableName extends 'FeeRecordCorrection'
  ? FeeRecordCorrectionEntity
  : TableName extends 'AzureFileInfo'
  ? AzureFileInfoEntity
  : TableName extends 'FeeRecordCorrectionTransientFormData'
  ? FeeRecordCorrectionTransientFormDataEntity
  : never;

const saveNewEntry = async <TableName extends SqlTableName>(tableName: TableName, entityToInsert: Entity<TableName>): Promise<Entity<TableName>> => {
  switch (tableName) {
    case 'UtilisationReport':
      return (await SqlDbDataSource.manager.save(UtilisationReportEntity, entityToInsert as UtilisationReportEntity)) as Entity<TableName>;
    case 'FeeRecord':
      return (await SqlDbDataSource.manager.save(FeeRecordEntity, entityToInsert as FeeRecordEntity)) as Entity<TableName>;
    case 'FeeRecordCorrection':
      return (await SqlDbDataSource.manager.save(FeeRecordCorrectionEntity, entityToInsert as FeeRecordCorrectionEntity)) as Entity<TableName>;
    case 'AzureFileInfo':
      return (await SqlDbDataSource.manager.save(AzureFileInfoEntity, entityToInsert as AzureFileInfoEntity)) as Entity<TableName>;
    case 'FeeRecordCorrectionTransientFormData':
      return (await SqlDbDataSource.manager.save(
        FeeRecordCorrectionTransientFormDataEntity,
        entityToInsert as FeeRecordCorrectionTransientFormDataEntity,
      )) as Entity<TableName>;
    default:
      throw new Error(`Cannot save new entry to table: no entity found for table name '${tableName}'`);
  }
};

const saveNewEntries = async <TableName extends SqlTableName>(tableName: TableName, entityToInsert: Entity<TableName>[]): Promise<Entity<TableName>[]> => {
  switch (tableName) {
    case 'UtilisationReport':
      return (await SqlDbDataSource.manager.save(UtilisationReportEntity, entityToInsert as UtilisationReportEntity[])) as Entity<TableName>[];
    case 'FeeRecord':
      return (await SqlDbDataSource.manager.save(FeeRecordEntity, entityToInsert as FeeRecordEntity[])) as Entity<TableName>[];
    case 'FeeRecordCorrection':
      return (await SqlDbDataSource.manager.save(FeeRecordCorrectionEntity, entityToInsert as FeeRecordCorrectionEntity[])) as Entity<TableName>[];
    case 'AzureFileInfo':
      return (await SqlDbDataSource.manager.save(AzureFileInfoEntity, entityToInsert as AzureFileInfoEntity[])) as Entity<TableName>[];
    case 'FeeRecordCorrectionTransientFormData':
      return (await SqlDbDataSource.manager.save(
        FeeRecordCorrectionTransientFormDataEntity,
        entityToInsert as FeeRecordCorrectionTransientFormDataEntity[],
      )) as Entity<TableName>[];
    default:
      throw new Error(`Cannot save entries to table: no entity found for table name '${tableName}'`);
  }
};

export const SqlDbHelper = {
  initialize,
  deleteAllEntries,
  saveNewEntry,
  saveNewEntries,
};

import { AzureFileInfoEntity, FeeRecordCorrectionEntity, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';

const initialize = async () => {
  if (SqlDbDataSource.isInitialized) {
    return SqlDbDataSource;
  }
  return await SqlDbDataSource.initialize();
};

type SqlTableName = 'UtilisationReport' | 'FeeRecord' | 'FeeRecordCorrection' | 'AzureFileInfo';

const deleteAllEntries = async (tableName: SqlTableName): Promise<void> => {
  switch (tableName) {
    case 'UtilisationReport':
      await SqlDbDataSource.manager.delete(UtilisationReportEntity, {});
      return;
    case 'FeeRecord':
      await SqlDbDataSource.manager.delete(FeeRecordEntity, {});
      return;
    case 'FeeRecordCorrection':
      await SqlDbDataSource.manager.delete(FeeRecordCorrectionEntity, {});
      return;
    case 'AzureFileInfo':
      await SqlDbDataSource.manager.delete(AzureFileInfoEntity, {});
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

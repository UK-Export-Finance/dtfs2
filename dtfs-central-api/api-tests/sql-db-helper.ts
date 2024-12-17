import {
  AzureFileInfoEntity,
  FacilityUtilisationDataEntity,
  FeeRecordCorrectionEntity,
  FeeRecordCorrectionTransientFormDataEntity,
  FeeRecordEntity,
  PaymentEntity,
  PaymentMatchingToleranceEntity,
  UtilisationReportEntity,
} from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { aListOfZeroThresholdActivePaymentMatchingTolerances } from '../test-helpers';

type SqlTableName =
  | 'UtilisationReport'
  | 'FeeRecord'
  | 'AzureFileInfo'
  | 'Payment'
  | 'FacilityUtilisationData'
  | 'PaymentMatchingTolerance'
  | 'FeeRecordCorrectionTransientFormData'
  | 'FeeRecordCorrection';

const deleteAllEntries = async (tableName: SqlTableName): Promise<void> => {
  switch (tableName) {
    case 'UtilisationReport':
      await SqlDbDataSource.manager.delete(UtilisationReportEntity, {});
      return;
    case 'FeeRecord':
      await SqlDbDataSource.manager.delete(FeeRecordEntity, {});
      return;
    case 'AzureFileInfo':
      await SqlDbDataSource.manager.delete(AzureFileInfoEntity, {});
      return;
    case 'Payment':
      await SqlDbDataSource.manager.delete(PaymentEntity, {});
      return;
    case 'FacilityUtilisationData':
      await SqlDbDataSource.manager.delete(FacilityUtilisationDataEntity, {});
      return;
    case 'PaymentMatchingTolerance':
      await SqlDbDataSource.manager.delete(PaymentMatchingToleranceEntity, {});
      return;
    case 'FeeRecordCorrection':
      await SqlDbDataSource.manager.delete(FeeRecordCorrectionEntity, {});
      return;
    case 'FeeRecordCorrectionTransientFormData':
      await SqlDbDataSource.manager.delete(FeeRecordCorrectionTransientFormDataEntity, {});
      return;
    default:
      throw new Error(`Cannot delete all entries from table: no entity found for table name '${tableName}'`);
  }
};

const deleteAll = async (): Promise<void> => {
  await deleteAllEntries('Payment');
  await deleteAllEntries('FeeRecord');
  await deleteAllEntries('UtilisationReport');
  await deleteAllEntries('AzureFileInfo');
  await deleteAllEntries('FacilityUtilisationData');
  await deleteAllEntries('PaymentMatchingTolerance');
  await deleteAllEntries('FeeRecordCorrectionTransientFormData');
  await deleteAllEntries('FeeRecordCorrection');
};

type Entity<TableName extends SqlTableName> = TableName extends 'UtilisationReport'
  ? UtilisationReportEntity
  : TableName extends 'FeeRecord'
  ? FeeRecordEntity
  : TableName extends 'AzureFileInfo'
  ? AzureFileInfoEntity
  : TableName extends 'Payment'
  ? PaymentEntity
  : TableName extends 'FacilityUtilisationData'
  ? FacilityUtilisationDataEntity
  : TableName extends 'PaymentMatchingTolerance'
  ? PaymentMatchingToleranceEntity
  : TableName extends 'FeeRecordCorrection'
  ? FeeRecordCorrectionEntity
  : TableName extends 'FeeRecordCorrectionTransientFormData'
  ? FeeRecordCorrectionTransientFormDataEntity
  : never;

const saveFacilityUtilisationDataIfNotExists = async (facilityUtilisationData: FacilityUtilisationDataEntity): Promise<void> => {
  const entityExists = await SqlDbDataSource.manager.existsBy(FacilityUtilisationDataEntity, { id: facilityUtilisationData.id });
  if (entityExists) {
    return;
  }
  await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, facilityUtilisationData);
};

const saveNewEntry = async <TableName extends SqlTableName>(tableName: TableName, entityToInsert: Entity<TableName>): Promise<Entity<TableName>> => {
  switch (tableName) {
    case 'UtilisationReport':
      return (await SqlDbDataSource.manager.save(UtilisationReportEntity, entityToInsert as UtilisationReportEntity)) as Entity<TableName>;
    case 'FeeRecord':
      await saveFacilityUtilisationDataIfNotExists((entityToInsert as FeeRecordEntity).facilityUtilisationData);
      return (await SqlDbDataSource.manager.save(FeeRecordEntity, entityToInsert as FeeRecordEntity)) as Entity<TableName>;
    case 'AzureFileInfo':
      return (await SqlDbDataSource.manager.save(AzureFileInfoEntity, entityToInsert as AzureFileInfoEntity)) as Entity<TableName>;
    case 'Payment':
      return (await SqlDbDataSource.manager.save(PaymentEntity, entityToInsert as PaymentEntity)) as Entity<TableName>;
    case 'FacilityUtilisationData':
      return (await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, entityToInsert as FacilityUtilisationDataEntity)) as Entity<TableName>;
    case 'PaymentMatchingTolerance':
      return (await SqlDbDataSource.manager.save(PaymentMatchingToleranceEntity, entityToInsert as PaymentMatchingToleranceEntity)) as Entity<TableName>;
    case 'FeeRecordCorrection':
      return (await SqlDbDataSource.manager.save(FeeRecordCorrectionEntity, entityToInsert as FeeRecordCorrectionEntity)) as Entity<TableName>;
    case 'FeeRecordCorrectionTransientFormData':
      return (await SqlDbDataSource.manager.save(
        FeeRecordCorrectionTransientFormDataEntity,
        entityToInsert as FeeRecordCorrectionTransientFormDataEntity,
      )) as Entity<TableName>;
    default:
      throw new Error(`Cannot save new entry to table: no entity found for table name '${tableName}'`);
  }
};

const saveNewEntries = async <TableName extends SqlTableName>(tableName: TableName, entitiesToInsert: Entity<TableName>[]): Promise<Entity<TableName>[]> => {
  switch (tableName) {
    case 'UtilisationReport':
      return (await SqlDbDataSource.manager.save(UtilisationReportEntity, entitiesToInsert as UtilisationReportEntity[])) as Entity<TableName>[];
    case 'FeeRecord':
      for (const { facilityUtilisationData } of entitiesToInsert as FeeRecordEntity[]) {
        await saveFacilityUtilisationDataIfNotExists(facilityUtilisationData);
      }
      return (await SqlDbDataSource.manager.save(FeeRecordEntity, entitiesToInsert as FeeRecordEntity[])) as Entity<TableName>[];
    case 'AzureFileInfo':
      return (await SqlDbDataSource.manager.save(AzureFileInfoEntity, entitiesToInsert as AzureFileInfoEntity[])) as Entity<TableName>[];
    case 'Payment':
      return (await SqlDbDataSource.manager.save(PaymentEntity, entitiesToInsert as PaymentEntity[])) as Entity<TableName>[];
    case 'FacilityUtilisationData':
      return (await SqlDbDataSource.manager.save(FacilityUtilisationDataEntity, entitiesToInsert as FacilityUtilisationDataEntity[])) as Entity<TableName>[];
    case 'PaymentMatchingTolerance':
      return (await SqlDbDataSource.manager.save(PaymentMatchingToleranceEntity, entitiesToInsert as PaymentMatchingToleranceEntity[])) as Entity<TableName>[];
    case 'FeeRecordCorrection':
      return (await SqlDbDataSource.manager.save(FeeRecordCorrectionEntity, entitiesToInsert as FeeRecordCorrectionEntity[])) as Entity<TableName>[];
    case 'FeeRecordCorrectionTransientFormData':
      return (await SqlDbDataSource.manager.save(
        FeeRecordCorrectionTransientFormDataEntity,
        entitiesToInsert as FeeRecordCorrectionTransientFormDataEntity[],
      )) as Entity<TableName>[];
    default:
      throw new Error(`Cannot save entries to table: no entity found for table name '${tableName}'`);
  }
};

const reinsertZeroThresholdPaymentMatchingTolerances = async () => {
  await deleteAllEntries('PaymentMatchingTolerance');
  await saveNewEntries('PaymentMatchingTolerance', aListOfZeroThresholdActivePaymentMatchingTolerances());
};

const initialize = async () => {
  if (SqlDbDataSource.isInitialized) {
    await reinsertZeroThresholdPaymentMatchingTolerances();
    return SqlDbDataSource;
  }
  const dataSource = await SqlDbDataSource.initialize();
  await reinsertZeroThresholdPaymentMatchingTolerances();
  return dataSource;
};

export const SqlDbHelper = {
  initialize,
  deleteAllEntries,
  deleteAll,
  saveNewEntry,
  saveNewEntries,
  reinsertZeroThresholdPaymentMatchingTolerances,
  manager: SqlDbDataSource.manager,
};

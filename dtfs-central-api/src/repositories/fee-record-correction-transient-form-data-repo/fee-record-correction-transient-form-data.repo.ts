import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { FeeRecordCorrectionTransientFormDataEntity } from '@ukef/dtfs2-common';

/**
 * Repository for managing fee record correction transient form data.
 */
export const FeeRecordCorrectionTransientFormDataRepo = SqlDbDataSource.getRepository(FeeRecordCorrectionTransientFormDataEntity);

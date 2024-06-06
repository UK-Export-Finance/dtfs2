import { EntityManager } from 'typeorm';
import { ApiError } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { TransactionFailedError } from '../errors';

type FunctionToExecuteWithTransaction<ReturnValue> = (transactionEntityManager: EntityManager) => Promise<ReturnValue>;

export const executeWithSqlTransaction = async <ReturnValue>(functionToExecute: FunctionToExecuteWithTransaction<ReturnValue>) => {
  const queryRunner = SqlDbDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result = await functionToExecute(queryRunner.manager);

    await queryRunner.commitTransaction();

    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    if (error instanceof ApiError) {
      throw new TransactionFailedError(error);
    }
    throw new TransactionFailedError();
  } finally {
    await queryRunner.release();
  }
};

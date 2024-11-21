import { EntityManager } from 'typeorm';
import { ApiError } from '@ukef/dtfs2-common';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { TransactionFailedError } from '../errors';

type FunctionToExecuteWithTransaction<ReturnValue> = (transactionEntityManager: EntityManager) => Promise<ReturnValue>;

/**
 * Helper to execute the SQL queries inside of the provided function
 * inside a transaction. The provided function should execute queries
 * using the `EntityManager` provided by this helper.
 *
 * This helper should be used in preference to `DataSource.withTransaction`
 * as it gives us more control over the error handling. The
 * `TransactionFailedError` will always be thrown by this helper, but
 * it can be initialised with any error which extends the `ApiError`.
 * This means that any function provided to this can throw specific
 * errors depending on what happens, and this helper will wrap
 * that error with the generic transaction failed error, providing
 * more specific error handling.
 *
 * @param functionToExecute - The function which executes SQL queries
 * @returns The value returned by `functionToExecute`
 *
 * @example
 * const newReport = new UtilisationReportEntity();
 *
 * const saveNewReportAndGetCount = async (entityManager: EntityManager) => {
 *   await entityManager.save(UtilisationReportEntity, newReport);
 *   return await entityManager.count(UtilisationReportEntity, {});
 * };
 *
 * const count = await executeWithSqlTransaction((entityManager) =>
 *   saveNewReportAndGetCount(entityManager),
 * );
 *
 * @example
 * const queryWithApiError = async (entityManager: EntityManager) => {
 *   const report = await entityManager.find(UtilisationReportEntity, { id: 1 });
 *   if (!report) {
 *     throw new NotFoundError('Failed to find a report!');
 *   }
 * };
 *
 * await executeWithSqlTransaction((entityManager) =>
 *   queryWithApiError(entityManager), // TransactionFailedError: Failed to find a report!
 * );
 *
 * @example
 * const queryWithError = async (entityManager: EntityManager) => {
 *   const report = await entityManager.find(UtilisationReportEntity, { id: 1 });
 *   if (!report) {
 *     throw new Error('Failed to find a report!');
 *   }
 * };
 *
 * await executeWithSqlTransaction((entityManager) =>
 *   queryWithError(entityManager), // TransactionFailedError: Unknown error
 * );
 */
export const executeWithSqlTransaction = async <ReturnValue>(functionToExecute: FunctionToExecuteWithTransaction<ReturnValue>) => {
  const queryRunner = SqlDbDataSource.createQueryRunner();

  try {
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result = await functionToExecute(queryRunner.manager);

    await queryRunner.commitTransaction();

    return result;
  } catch (error) {
    console.error('Error thrown within SQL transaction: %o', error);

    await queryRunner.rollbackTransaction();
    if (error instanceof ApiError) {
      throw TransactionFailedError.forApiError(error);
    }
    if (error instanceof Error) {
      throw TransactionFailedError.forError(error);
    }
    throw TransactionFailedError.forUnknownError();
  } finally {
    await queryRunner.release();
  }
};

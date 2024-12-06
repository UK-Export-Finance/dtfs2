import { QueryRunner } from 'typeorm';
import { HttpStatusCode } from 'axios';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { TestApiError } from '@ukef/dtfs2-common';
import { executeWithSqlTransaction } from './execute-with-sql-transaction';
import { TransactionFailedError } from '../errors';

describe('executeWithSqlTransaction', () => {
  const mockConnect = jest.fn();
  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockRollbackTransaction = jest.fn();
  const mockRelease = jest.fn();

  const mockSave = jest.fn();

  const mockQueryRunner = {
    connect: mockConnect,
    startTransaction: mockStartTransaction,
    commitTransaction: mockCommitTransaction,
    rollbackTransaction: mockRollbackTransaction,
    release: mockRelease,
    manager: {
      save: mockSave,
    },
  } as unknown as QueryRunner;

  const createQueryRunnerSpy = jest.spyOn(SqlDbDataSource, 'createQueryRunner');

  beforeEach(() => {
    createQueryRunnerSpy.mockReturnValue(mockQueryRunner);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates a query runner', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockResolvedValue(undefined);

    // Act
    await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(createQueryRunnerSpy).toHaveBeenCalled();
  });

  it('initialises the query runner database connection', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockResolvedValue(undefined);

    // Act
    await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(mockConnect).toHaveBeenCalled();
  });

  it('starts the transaction', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockResolvedValue(undefined);

    // Act
    await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(mockStartTransaction).toHaveBeenCalled();
  });

  it('commits the transaction if the supplied function successfully executes', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockResolvedValue(undefined);

    // Act
    await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(mockCommitTransaction).toHaveBeenCalled();
  });

  it('releases the query runner connection if the supplied function successfully executes', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockResolvedValue(undefined);

    // Act
    await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(mockRelease).toHaveBeenCalled();
  });

  it('throws and does not commit the transaction if the supplied function throws an error', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockRejectedValue(new Error('Some error'));

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow();
    expect(mockCommitTransaction).not.toHaveBeenCalled();
  });

  it('throws and rolls back the transaction if the supplied function throws an error', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockRejectedValue(new Error('Some error'));

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow();
    expect(mockRollbackTransaction).toHaveBeenCalled();
  });

  it('throws and releases the query runner connection if the supplied function throws an error', async () => {
    // Arrange
    const functionToExecute = jest.fn().mockRejectedValue(new Error('Some error'));

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow();
    expect(mockRelease).toHaveBeenCalled();
  });

  it("throws a generic 'TransactionFailedError' if the supplied function throws an unexpected error", async () => {
    // Arrange
    const functionToExecute = jest.fn().mockRejectedValue('Some rejected value');

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow(TransactionFailedError.forUnknownError());
  });

  it("throws a specific 'TransactionFailedError' if the supplied function throws an 'Error'", async () => {
    // Arrange
    const error = new Error('Some error');
    const functionToExecute = jest.fn().mockRejectedValue(error);

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow(TransactionFailedError.forError(error));
  });

  it("throws a specific 'TransactionFailedError' if the supplied function throws an 'ApiError'", async () => {
    // Arrange
    const customError = new TestApiError({ status: HttpStatusCode.BadRequest });

    const functionToExecute = jest.fn().mockRejectedValue(customError);

    // Act / Assert
    await expect(executeWithSqlTransaction(functionToExecute)).rejects.toThrow(TransactionFailedError.forApiError(customError));
  });

  it('returns the return value of the supplied function', async () => {
    // Arrange
    const returnValue = {
      someNumber: 5,
      someString: 'A string',
    };

    const functionToExecute = jest.fn().mockResolvedValue(returnValue);

    // Act
    const result = await executeWithSqlTransaction(functionToExecute);

    // Assert
    expect(result).toEqual(returnValue);
  });
});

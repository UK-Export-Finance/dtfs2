import { QueryRunner } from 'typeorm';

export const getMockQueryRunner = (): QueryRunner => {
  const mockConnect = jest.fn();
  const mockStartTransaction = jest.fn();
  const mockCommitTransaction = jest.fn();
  const mockRollbackTransaction = jest.fn();
  const mockRelease = jest.fn();

  const mockTransactionManager = {
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockQueryRunner = {
    connect: mockConnect,
    startTransaction: mockStartTransaction,
    commitTransaction: mockCommitTransaction,
    rollbackTransaction: mockRollbackTransaction,
    release: mockRelease,
    manager: mockTransactionManager,
  } as unknown as QueryRunner;
  return mockQueryRunner;
};

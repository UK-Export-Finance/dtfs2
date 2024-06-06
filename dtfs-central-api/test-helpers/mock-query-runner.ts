import { QueryRunner } from 'typeorm';

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

export const getQueryRunnerMocks = () => ({
  mockConnect,
  mockStartTransaction,
  mockCommitTransaction,
  mockRollbackTransaction,
  mockRelease,
  mockSave,
  mockQueryRunner,
});

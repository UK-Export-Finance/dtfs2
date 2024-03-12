import { asString } from '@ukef/dtfs2-common';
import { deleteAllAcbsDurableFunctionLogs } from '../../services/repositories/durable-functions-repo';
import { deleteAcbsDurableFunctionLogsJob } from '.';
import { WriteConcernError } from '../../errors';

console.info = jest.fn();

jest.mock('../../services/repositories/durable-functions-repo', () => ({
  deleteAllAcbsDurableFunctionLogs: jest.fn(),
}));
jest.mock('@ukef/dtfs2-common', () => ({
  asString: jest.fn(),
}));

const originalProcessEnv = process.env;
describe('scheduler/jobs/delete-acbs-durable-function-logs', () => {
  beforeEach(() => {
    jest.mocked(asString).mockImplementation((value) => value as string);
  });

  afterEach(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('the task', () => {
    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls deleteAllAcbsDurableFunctionLogs from the durable functions repo', async () => {
      // Arrange
      jest.mocked(deleteAllAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      // Act
      await deleteAcbsDurableFunctionLogsJob.task(new Date());

      // Assert
      expect(deleteAllAcbsDurableFunctionLogs).toHaveBeenCalled();
    });

    it('throws an error if deleteAllAcbsDurableFunctionLogs throws an error', async () => {
      // Arrange
      const errorMessage = 'This is an error';
      const error = new Error(errorMessage);
      jest.mocked(deleteAllAcbsDurableFunctionLogs).mockRejectedValue(error);

      // Act
      await expect(deleteAcbsDurableFunctionLogsJob.task(new Date())).rejects.toThrow(Error);
    });

    it('throws an error if deleteAllAcbsDurableFunctionLogs fails to write', async () => {
      // Arrange
      jest.mocked(deleteAllAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: false, deletedCount: 1 });

      // Act
      await expect(deleteAcbsDurableFunctionLogsJob.task(new Date())).rejects.toThrow(WriteConcernError);
    });

    it('does not throw if deleteAllAcbsDurableFunctionLogs resolves', async () => {
      // Arrange
      jest.mocked(deleteAllAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      // Act
      const result = await deleteAcbsDurableFunctionLogsJob.task(new Date());

      // Assert
      expect(result).toEqual(undefined);
    });
  });
});

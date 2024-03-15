import { asString } from '@ukef/dtfs2-common';
import { deleteAllCompleteAcbsDurableFunctionLogs } from '../../services/repositories/durable-functions-repo';
import { deleteCompleteAcbsDurableFunctionLogsJob } from '.';
import { WriteConcernError } from '../../errors';

console.info = jest.fn();

jest.mock('../../services/repositories/durable-functions-repo', () => ({
  deleteAllCompleteAcbsDurableFunctionLogs: jest.fn(),
}));
jest.mock('@ukef/dtfs2-common', () => ({
  asString: jest.fn(),
}));

describe('scheduler/jobs/delete-acbs-durable-function-logs', () => {
  describe('the task', () => {
    beforeEach(() => {
      jest.mocked(asString).mockImplementation((value) => value as string);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('calls deleteAllCompleteAcbsDurableFunctionLogs from the durable functions repo', async () => {
      // Arrange
      jest.mocked(deleteAllCompleteAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      // Act
      await deleteCompleteAcbsDurableFunctionLogsJob.task(new Date());

      // Assert
      expect(deleteAllCompleteAcbsDurableFunctionLogs).toHaveBeenCalled();
    });

    it('throws an error if deleteAllCompleteAcbsDurableFunctionLogs throws an error', async () => {
      // Arrange
      const errorMessage = 'This is an error';
      const error = new Error(errorMessage);
      jest.mocked(deleteAllCompleteAcbsDurableFunctionLogs).mockRejectedValue(error);

      // Act
      await expect(deleteCompleteAcbsDurableFunctionLogsJob.task(new Date())).rejects.toThrow(Error);
    });

    it('throws an error if deleteAllCompleteAcbsDurableFunctionLogs fails to write', async () => {
      // Arrange
      jest.mocked(deleteAllCompleteAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: false, deletedCount: 1 });

      // Act
      await expect(deleteCompleteAcbsDurableFunctionLogsJob.task(new Date())).rejects.toThrow(WriteConcernError);
    });

    it('does not throw if deleteAllCompleteAcbsDurableFunctionLogs resolves with documents deleted', async () => {
      // Arrange
      jest.mocked(deleteAllCompleteAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: true, deletedCount: 1 });

      // Act
      const result = await deleteCompleteAcbsDurableFunctionLogsJob.task(new Date());

      // Assert
      expect(result).toEqual(undefined);
    });

    it('does not throw if deleteAllCompleteAcbsDurableFunctionLogs resolves with no documents deleted', async () => {
      // Arrange
      jest.mocked(deleteAllCompleteAcbsDurableFunctionLogs).mockResolvedValue({ acknowledged: true, deletedCount: 0 });

      // Act
      const result = await deleteCompleteAcbsDurableFunctionLogsJob.task(new Date());

      // Assert
      expect(result).toEqual(undefined);
    });
  });
});

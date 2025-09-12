import { LessThan } from 'typeorm';
import { deleteAllOldCorrectionTransientFormData, deleteAllOldCorrectionTransientFormDataJob } from '.';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo/fee-record-correction-request-transient-form-data.repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../repositories/fee-record-correction-transient-form-data-repo';

console.error = jest.fn();

describe('delete-correction-and-correction-request-transient-form-data', () => {
  jest.mock('typeorm', () => ({
    LessThan: jest.fn(),
  }));

  const mockCorrectionDelete = jest.fn();
  const mockCorrectionRequestDelete = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('deleteAllOldCorrectionTransientFormData', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-02 12:10:00'));

      FeeRecordCorrectionTransientFormDataRepo.delete = mockCorrectionDelete;
      FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockCorrectionRequestDelete;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should delete "correction transient data" records older than one day', async () => {
      // Act
      await deleteAllOldCorrectionTransientFormData();

      // Assert
      const expectedDeletionCallArgs = {
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      };

      expect(mockCorrectionDelete).toHaveBeenCalledTimes(1);
      expect(mockCorrectionDelete).toHaveBeenCalledWith(expectedDeletionCallArgs);
    });

    it('should delete "correction request transient data" records older than one day', async () => {
      // Act
      await deleteAllOldCorrectionTransientFormData();

      // Assert
      const expectedDeletionCallArgs = {
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      };

      expect(mockCorrectionRequestDelete).toHaveBeenCalledTimes(1);
      expect(mockCorrectionRequestDelete).toHaveBeenCalledWith(expectedDeletionCallArgs);
    });

    it('should delete "correction transient data" records older than one day if it is the first day of the month', async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2025-01-01 12:10:00'));

      // Act
      await deleteAllOldCorrectionTransientFormData();

      // Assert
      const expectedDeletionCallArgs = {
        lastUpdatedAt: LessThan(new Date('2024-12-31:12:10:00')),
      };

      expect(mockCorrectionDelete).toHaveBeenCalledTimes(1);
      expect(mockCorrectionDelete).toHaveBeenCalledWith(expectedDeletionCallArgs);
    });

    it('should delete "correction request transient data" records older than one day if it is the first day of the month', async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2025-01-01 12:10:00'));

      // Act
      await deleteAllOldCorrectionTransientFormData();

      // Assert
      const expectedDeletionCallArgs = {
        lastUpdatedAt: LessThan(new Date('2024-12-31:12:10:00')),
      };

      expect(mockCorrectionRequestDelete).toHaveBeenCalledTimes(1);
      expect(mockCorrectionRequestDelete).toHaveBeenCalledWith(expectedDeletionCallArgs);
    });

    describe('when record correction transient data deletion fails', () => {
      it('should throw an error', async () => {
        // Arrange
        const errorMessage = 'This is an error';
        const error = new Error(errorMessage);

        jest.mocked(mockCorrectionDelete).mockRejectedValue(error);

        // Act
        await deleteAllOldCorrectionTransientFormData();

        // Assert
        expect(mockCorrectionDelete).toHaveBeenCalledTimes(1);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          'Error deleting old transient record correction form data - deleteCorrectionRequestTransientFormData CRON job: %o',
          error,
        );
      });

      it('should still call record correction request transient data deletion', async () => {
        // Act
        await deleteAllOldCorrectionTransientFormData();

        // Assert
        expect(mockCorrectionRequestDelete).toHaveBeenCalledTimes(1);
      });
    });

    describe('when record correction request transient data deletion fails', () => {
      it('should throw an error', async () => {
        // Arrange
        const errorMessage = 'This is an error';
        const error = new Error(errorMessage);

        jest.mocked(mockCorrectionRequestDelete).mockRejectedValue(error);

        // Act
        await deleteAllOldCorrectionTransientFormData();

        // Assert
        expect(mockCorrectionRequestDelete).toHaveBeenCalledTimes(1);

        expect(console.error).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
          'Error deleting old transient record correction request form data - deleteCorrectionRequestTransientFormData CRON job: %o',
          error,
        );
      });

      it('should still call record correction transient data deletion', async () => {
        // Act
        await deleteAllOldCorrectionTransientFormData();

        // Assert
        expect(mockCorrectionDelete).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('deleteRecordCorrectionRequestTransientFormDataJob', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-02 12:10:00'));

      FeeRecordCorrectionTransientFormDataRepo.delete = mockCorrectionDelete;
      FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockCorrectionRequestDelete;
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should be scheduled to run', () => {
      // Assert
      expect(deleteAllOldCorrectionTransientFormDataJob.cronExpression).toEqual(process.env.RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE);
    });

    it('should have the correct description', () => {
      // Assert
      expect(deleteAllOldCorrectionTransientFormDataJob.description).toEqual(
        'Deletes record correction and record correction request transient form data older than 1 day',
      );
    });

    it('should call FeeRecordCorrectionTransientFormDataRepo.delete', async () => {
      // Act
      await deleteAllOldCorrectionTransientFormDataJob.task('manual');

      // Assert
      expect(mockCorrectionDelete).toHaveBeenCalledTimes(1);

      expect(mockCorrectionDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });

    it('should call FeeRecordCorrectionRequestTransientFormDataRepo.delete', async () => {
      // Act
      await deleteAllOldCorrectionTransientFormDataJob.task('manual');

      // Assert
      expect(mockCorrectionRequestDelete).toHaveBeenCalledTimes(1);

      expect(mockCorrectionRequestDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });
  });
});

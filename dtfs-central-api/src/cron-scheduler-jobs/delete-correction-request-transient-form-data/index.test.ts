import { LessThan } from 'typeorm';
import { deleteCorrectionRequestTransientFormData, deleteCorrectionRequestTransientFormDataJob } from '.';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo/fee-record-correction-request-transient-form-data.repo';

describe('delete-record-correction-request-transient-form-data', () => {
  jest.mock('typeorm', () => ({
    LessThan: jest.fn(),
  }));

  const mockDelete = jest.fn();
  console.error = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.resetAllMocks();
    FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockDelete;
  });

  describe('deleteRecordCorrectionRequestTransientFormData', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockDelete;
      jest.useFakeTimers().setSystemTime(new Date('2025-01-02 12:10:00'));
    });

    it('should delete records older than one day', async () => {
      await deleteCorrectionRequestTransientFormData();

      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });

    it('should delete records older than one day if it is the first day of the month', async () => {
      jest.useFakeTimers().setSystemTime(new Date('2025-01-01 12:10:00'));

      await deleteCorrectionRequestTransientFormData();

      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2024-12-31:12:10:00')),
      });
    });

    it('should throw an error if deletion fails', async () => {
      const errorMessage = 'This is an error';
      const error = new Error(errorMessage);
      jest.mocked(mockDelete).mockRejectedValue(error);

      await deleteCorrectionRequestTransientFormData();

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        'Error deleting old transient record correction requests - deleteCorrectionRequestTransientFormDataJob CRON job: %o',
        error,
      );
    });
  });

  describe('deleteRecordCorrectionRequestTransientFormDataJob', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockDelete;
      jest.useFakeTimers().setSystemTime(new Date('2025-01-02 12:10:00'));
    });

    it('should be scheduled to run', () => {
      expect(deleteCorrectionRequestTransientFormDataJob.cronExpression).toEqual(process.env.RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE);
    });

    it('should have the correct description', () => {
      expect(deleteCorrectionRequestTransientFormDataJob.description).toEqual('Delete record correction transient form data older than 1 day');
    });

    it('should call FeeRecordCorrectionRequestTransientFormDataRepo.delete', async () => {
      // Act
      await deleteCorrectionRequestTransientFormDataJob.task('manual');

      // Assert
      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });
  });
});

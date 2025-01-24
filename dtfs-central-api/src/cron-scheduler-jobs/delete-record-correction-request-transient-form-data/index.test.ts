import { LessThan } from 'typeorm';
import { deleteRecordCorrectionRequestTransientFormData, deleteRecordCorrectionRequestTransientFormDataJob } from '.';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo/fee-record-correction-request-transient-form-data.repo';

describe('delete-record-correction-request-transient-form-data', () => {
  jest.mock('typeorm', () => ({
    LessThan: jest.fn(),
  }));

  const mockDelete = jest.fn();

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
      await deleteRecordCorrectionRequestTransientFormData();

      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });

    it('should throw an error if deletion fails', async () => {
      const errorMessage = 'This is an error';
      const error = new Error(errorMessage);
      jest.mocked(mockDelete).mockRejectedValue(error);

      // Act
      await expect(deleteRecordCorrectionRequestTransientFormData()).rejects.toThrow(Error);
    });
  });

  describe('deleteRecordCorrectionRequestTransientFormDataJob', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      FeeRecordCorrectionRequestTransientFormDataRepo.delete = mockDelete;
      jest.useFakeTimers().setSystemTime(new Date('2025-01-02 12:10:00'));
    });

    it('should be scheduled to run', () => {
      expect(deleteRecordCorrectionRequestTransientFormDataJob.cronExpression).toEqual(process.env.RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE);
    });

    it('should have the correct description', () => {
      expect(deleteRecordCorrectionRequestTransientFormDataJob.description).toEqual('Delete record correction transient form data older than 1 day');
    });

    it('should call FeeRecordCorrectionRequestTransientFormDataRepo.deleteAllOlderThanOneDay', async () => {
      // Act
      await deleteRecordCorrectionRequestTransientFormDataJob.task('manual');

      // Assert
      expect(mockDelete).toHaveBeenCalledTimes(1);

      expect(mockDelete).toHaveBeenCalledWith({
        lastUpdatedAt: LessThan(new Date('2025-01-01:12:10:00')),
      });
    });
  });
});

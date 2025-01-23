import { deleteRecordCorrectionRequestTransientFormData, deleteRecordCorrectionRequestTransientFormDataJob } from '.';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo/fee-record-correction-request-transient-form-data.repo';

describe('delete-record-correction-request-transient-form-data', () => {
  const mockDelete = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    FeeRecordCorrectionRequestTransientFormDataRepo.deleteAllOlderThanOneDay = mockDelete;
  });

  describe('deleteRecordCorrectionRequestTransientFormData', () => {
    it('should delete records older than one day', async () => {
      await deleteRecordCorrectionRequestTransientFormData();

      expect(mockDelete).toHaveBeenCalledTimes(1);
    });

    it('should log an error if deletion fails', async () => {
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
      FeeRecordCorrectionRequestTransientFormDataRepo.deleteAllOlderThanOneDay = mockDelete;
    });

    it('should be scheduled to run', () => {
      expect(deleteRecordCorrectionRequestTransientFormDataJob.cronExpression).toEqual(process.env.RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE);
    });

    it('should have the correct description', () => {
      expect(deleteRecordCorrectionRequestTransientFormDataJob.description).toEqual('Delete record correction transient form data older than 1 day');
    });

    it('should call findPendingDealCancellations', async () => {
      // Act
      await deleteRecordCorrectionRequestTransientFormDataJob.task('manual');

      // Assert
      expect(mockDelete).toHaveBeenCalledTimes(1);
    });
  });
});

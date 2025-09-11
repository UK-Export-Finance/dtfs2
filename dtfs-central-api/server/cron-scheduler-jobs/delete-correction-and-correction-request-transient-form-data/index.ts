import { asString, CronSchedulerJob } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo';
import { FeeRecordCorrectionTransientFormDataRepo } from '../../repositories/fee-record-correction-transient-form-data-repo';

const { RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE } = process.env;

/**
 * Deletes record correction and correction request transient form data more than 1 day old.
 */
export const deleteAllOldCorrectionTransientFormData = async (): Promise<void> => {
  console.info('Deleting old transient record corrections and correction requests - deleteCorrectionRequestTransientFormData CRON job');

  try {
    await FeeRecordCorrectionTransientFormDataRepo.deleteByLastUpdatedOlderThanOneDayAgo();
  } catch (error) {
    console.error('Error deleting old transient record correction form data - deleteCorrectionRequestTransientFormData CRON job: %o', error);
  }

  try {
    await FeeRecordCorrectionRequestTransientFormDataRepo.deleteByLastUpdatedOlderThanOneDayAgo();
  } catch (error) {
    console.error('Error deleting old transient record correction request form data - deleteCorrectionRequestTransientFormData CRON job: %o', error);
  }
};

export const deleteAllOldCorrectionTransientFormDataJob: CronSchedulerJob = {
  cronExpression: asString(RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE, 'RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE'),
  description: 'Deletes record correction and record correction request transient form data older than 1 day',
  task: deleteAllOldCorrectionTransientFormData,
};

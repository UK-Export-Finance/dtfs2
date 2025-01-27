import { asString, CronSchedulerJob } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo';

const { RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE } = process.env;

/**
 * Deletes record correction request transient form data more than 1 day old
 */
export const deleteCorrectionRequestTransientFormData = async (): Promise<void> => {
  try {
    console.info('Getting and deleting old transient record correction requests - deleteCorrectionRequestTransientFormDataJob CRON job');

    await FeeRecordCorrectionRequestTransientFormDataRepo.deleteByLastUpdatedOlderThanOneDayAgo();
  } catch (error) {
    console.error('Error deleting old transient record correction requests - deleteCorrectionRequestTransientFormDataJob CRON job: %o', error);
  }
};

export const deleteCorrectionRequestTransientFormDataJob: CronSchedulerJob = {
  cronExpression: asString(RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE, 'RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE'),
  description: 'Delete record correction transient form data older than 1 day',
  task: deleteCorrectionRequestTransientFormData,
};

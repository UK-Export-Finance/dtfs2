import { asString, CronSchedulerJob } from '@ukef/dtfs2-common';
import { FeeRecordCorrectionRequestTransientFormDataRepo } from '../../repositories/fee-record-correction-request-transient-form-data-repo';

const { RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE } = process.env;

/**
 * Gets and deletes record correction request transient form data if older than 1 day
 * gets all from the database which are older than 1 day
 * returns if none found
 * gets an array of feeIds
 * deletes transient form data based on provided ids
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

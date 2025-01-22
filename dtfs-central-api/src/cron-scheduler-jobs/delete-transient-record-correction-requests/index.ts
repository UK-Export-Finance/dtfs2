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
const deleteOldRecordCorrectionRequestTransientFormData = async (): Promise<void> => {
  try {
    console.info('Getting and deleting old transient record correction requests - deleteOldRecordCorrectionRequestTransientFormData CRON job');

    await FeeRecordCorrectionRequestTransientFormDataRepo.deleteAllOlderThanOneDay();
  } catch (error) {
    console.error('Error deleting old transient record correction requests - deleteOldRecordCorrectionRequestTransientFormData CRON job: %o', error);

    throw error;
  }
};

export const deleteTransientRecordCorrectionRequestsJob: CronSchedulerJob = {
  cronExpression: asString(RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE, 'RECORD_CORRECTION_TRANSIENT_FORM_DATA_DELETE_SCHEDULE'),
  description: 'Delete record correction transient form data',
  task: deleteOldRecordCorrectionRequestTransientFormData,
};

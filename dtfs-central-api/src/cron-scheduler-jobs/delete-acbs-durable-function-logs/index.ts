import { asString, CronSchedulerJob } from '@ukef/dtfs2-common';
import { WriteConcernError } from '../../errors';
import { deleteAllCompleteAcbsDurableFunctionLogs } from '../../services/repositories/durable-functions-repo';

const { ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE } = process.env;

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Completed"
 * @throws {WriteConcernError} If the deletion fails to write
 */
const deleteCompleteAcbsDurableFunctionLogs = async (): Promise<void> => {
  const { acknowledged } = await deleteAllCompleteAcbsDurableFunctionLogs();
  if (!acknowledged) {
    throw new WriteConcernError();
  }
};

export const deleteCompleteAcbsDurableFunctionLogsJob: CronSchedulerJob = {
  cronExpression: asString(ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE, 'ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE'),
  description: 'Deletes durable function logs that have the type "ACBS" and status "Completed"',
  task: deleteCompleteAcbsDurableFunctionLogs,
};

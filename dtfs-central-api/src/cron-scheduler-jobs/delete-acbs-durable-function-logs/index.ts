import { asString, CronSchedulerJob } from '@ukef/dtfs2-common';
import { WriteConcernError } from '../../errors';
import { deleteAllAcbsDurableFunctionLogs } from '../../services/repositories/durable-functions-repo';

const { ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE } = process.env;

const deleteAcbsDurableFunctionLogs = async (): Promise<void> => {
  const { acknowledged } = await deleteAllAcbsDurableFunctionLogs();
  if (!acknowledged) {
    throw new WriteConcernError();
  }
};

export const deleteAcbsDurableFunctionLogsJob: CronSchedulerJob = {
  cronExpression: asString(ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE, 'ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE'),
  description: 'Deletes durable function logs that have the type "ACBS"',
  task: deleteAcbsDurableFunctionLogs,
};

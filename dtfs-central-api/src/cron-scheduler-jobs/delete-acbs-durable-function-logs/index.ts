import { asString, CronSchedulerJob, DocumentNotFoundError, WriteConcernError } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { deleteAllCompleteAcbsDurableFunctionLogs } from '../../repositories/durable-functions-repo';

const { ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE } = process.env;

/**
 * Deletes all durable function logs that have the type "ACBS" and status "Completed"
 * @throws {WriteConcernError} If the deletion fails to write
 */
const deleteCompleteAcbsDurableFunctionLogs = async (): Promise<void> => {
  try {
    const { acknowledged } = await deleteAllCompleteAcbsDurableFunctionLogs(generateSystemAuditDetails());

    if (!acknowledged) {
      throw new WriteConcernError();
    }
  } catch (error) {
    if (!(error instanceof DocumentNotFoundError)) {
      throw error;
    }
  }
};

export const deleteCompleteAcbsDurableFunctionLogsJob: CronSchedulerJob = {
  cronExpression: asString(ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE, 'ACBS_DURABLE_FUNCTIONS_LOG_DELETION_SCHEDULE'),
  description: 'Deletes durable function logs that have the type "ACBS" and status "Completed"',
  task: deleteCompleteAcbsDurableFunctionLogs,
};

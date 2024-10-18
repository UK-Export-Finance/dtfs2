import { CronSchedulerJob, TFM_DEAL_CANCELLATION_STATUS, TFM_DEAL_STAGE } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { endOfDay } from 'date-fns';
import { ObjectId } from 'mongodb';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { TfmDealRepo } from '../../repositories/tfm-deals-repo/tfm-deals.repo';

/**
 * Updates deals to be cancelled
 * @param dealIds the deals to be cancelled
 */
const cancelDeals = async (dealIds: ObjectId[]) => {
  await Promise.all(
    dealIds.map((dealId) =>
      TfmDealRepo.updateOneDeal(
        dealId.toString(),
        { dealSnapshot: { stage: TFM_DEAL_STAGE.CANCELLED }, tfm: { cancellation: { status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED } } },
        generateSystemAuditDetails(),
      ),
    ),
  );
};

/**
 * Gets deal ids with a scheduled cancellation & effective date today or in the past
 * @returns The deal ids to cancel
 */
const getDealIdsWithCancellationsScheduledForThePast = async (): Promise<ObjectId[]> => {
  const dealsScheduledForCancellation = await TfmDealCancellationRepo.findScheduledDealCancellations();

  return dealsScheduledForCancellation.filter((deals) => deals.tfm.cancellation!.effectiveFrom < endOfDay(new Date()).valueOf()).map(({ _id }) => _id);
};

/**
 * Cancels deals scheduled to be cancelled in the past
 */
const cancelScheduledDeals = async (): Promise<void> => {
  const dealIds = await getDealIdsWithCancellationsScheduledForThePast();

  await cancelDeals(dealIds);
};

export const cancelDealJob: CronSchedulerJob = {
  cronExpression: '30 2 * * *',
  description: 'Cancel deals in the database that have been scheduled & the effective from date has passed',
  task: cancelScheduledDeals,
};

import { CronSchedulerJob, TfmDeal } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { endOfDay } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';

/**
 * Updates deals to be cancelled
 * @param dealIds the deals to be cancelled
 */
const cancelDeals = async (deals: TfmDeal[]) => {
  await Promise.all(deals.map((deal) => TfmDealCancellationRepo.submitDealCancellation(deal._id, deal.tfm.cancellation!, generateSystemAuditDetails())));
};

/**
 * Gets deal ids with a scheduled cancellation & effective date today or in the past
 * @returns The deal ids to cancel
 */
const getDealsWithCancellationsScheduledForThePast = async (): Promise<TfmDeal[]> => {
  const dealsScheduledForCancellation = await TfmDealCancellationRepo.findScheduledDealCancellations();

  return dealsScheduledForCancellation.filter((deals) => deals.tfm.cancellation!.effectiveFrom < endOfDay(new Date()).valueOf());
};

/**
 * Cancels deals scheduled to be cancelled in the past
 */
const cancelScheduledDeals = async (): Promise<void> => {
  const deals = await getDealsWithCancellationsScheduledForThePast();

  await cancelDeals(deals);
};

export const cancelDealJob: CronSchedulerJob = {
  cronExpression: '30 2 * * *',
  description: 'Cancel deals in the database that have been scheduled & the effective from date has passed',
  task: cancelScheduledDeals,
};

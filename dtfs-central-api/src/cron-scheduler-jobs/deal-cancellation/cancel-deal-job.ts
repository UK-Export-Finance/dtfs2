import { asString, CronSchedulerJob, TfmDealWithCancellation } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { endOfDay } from 'date-fns';
import { TfmDealCancellationRepo } from '../../repositories/tfm-deals-repo';
import { DealCancellationService } from '../../services/tfm/deal-cancellation.service';

const { DEAL_CANCELLATION_SCHEDULE } = process.env;

/**
 * Updates deals to be cancelled
 * @param dealIds the deals to be cancelled
 */
const cancelDeals = async (deals: TfmDealWithCancellation[]) => {
  await Promise.all(
    deals.map(async (deal) => DealCancellationService.processPendingCancellation(deal._id, deal.tfm.cancellation, generateSystemAuditDetails())),
  );
};

/**
 * Gets deal ids with a pending cancellation & effective date today or in the past
 * @returns The deal ids to cancel
 */
const getDealsWithPastPendingCancellations = async (): Promise<TfmDealWithCancellation[]> => {
  const dealsPendingCancellation = await TfmDealCancellationRepo.findPendingDealCancellations();

  return dealsPendingCancellation.filter((deals) => deals.tfm.cancellation.effectiveFrom < endOfDay(new Date()).valueOf());
};

/**
 * Cancels deals pending cancellation, with effective from date in the past
 */
const cancelPendingDeals = async (): Promise<void> => {
  const deals = await getDealsWithPastPendingCancellations();

  await cancelDeals(deals);
};

export const cancelDealJob: CronSchedulerJob = {
  cronExpression: asString(DEAL_CANCELLATION_SCHEDULE, 'DEAL_CANCELLATION_SCHEDULE'),
  description: 'Cancel deals in the database that are pending cancellation & the effective from date has passed',
  task: cancelPendingDeals,
};

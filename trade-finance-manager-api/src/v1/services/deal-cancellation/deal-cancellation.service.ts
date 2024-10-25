import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { AuditDetails, DATE_FORMATS, TEAMS, TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';
import { UKEF_ID } from '../../../constants/deals';
import { getUkefFacilityIds } from './helpers/get-ukef-facility-ids';

const { D_MMMM_YYYY } = DATE_FORMATS;

type SubmitDealCancellationParams = {
  dealId: string;
  cancellation: TfmDealCancellation;
  auditDetails: AuditDetails;
};

export class DealCancellationService {
  /**
   * Sends email to PIM email address confirming the cancellation has been submitted
   * @param ukefDealId ukef deal id
   * @param dealCancellation deal cancellation object
   * @param facilityIds ukef facility ids
   *
   * This function is exported for unit testing only and should not be used outside of the service
   */
  public static async sendDealCancellationEmail(ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]): Promise<void> {
    console.info(`Sending deal cancellation email for ${ukefDealId}`);

    const effectiveFromDate = toDate(dealCancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);

    if (!pimEmail) {
      throw Error('Failed to send deal cancellation email to PIM');
    }

    const emailTemplateId = isAfter(effectiveFromDate, endOfToday) ? CANCEL_DEAL_FUTURE_DATE : CANCEL_DEAL_PAST_DATE;

    const formattedEffectiveFromDate = format(dealCancellation.effectiveFrom, D_MMMM_YYYY);
    const formattedBankRequestDate = format(dealCancellation.bankRequestDate, D_MMMM_YYYY);
    const cancelReason = dealCancellation.reason || '-';

    await sendTfmEmail(emailTemplateId, pimEmail, {
      ukefDealId,
      effectiveFromDate: formattedEffectiveFromDate,
      bankRequestDate: formattedBankRequestDate,
      cancelReason,
      formattedFacilitiesList: formatFacilityIds(facilityIds),
    });
  }

  /**
   * Submit the deal cancellation
   *
   * @param params
   * @param params.dealId the Deal ID
   * @param params.dealCancellation the deal cancellation object
   * @param params.auditDetails the users audit details
   */
  public static async submitDealCancellation({ dealId, cancellation, auditDetails }: SubmitDealCancellationParams) {
    console.info(`Submitting deal cancellation for ${dealId}`);

    const { cancelledDealUkefId } = await api.submitDealCancellation({ dealId, cancellation, auditDetails });
    const facilities = await api.findFacilitiesByDealId(dealId);

    const ukefFacilityIds = getUkefFacilityIds(facilities);

    if (!ukefFacilityIds.length) {
      throw new Error(`Failed to find facility ids on deal ${dealId} when submitting deal cancellation`);
    }

    if (ukefFacilityIds.includes(UKEF_ID.PENDING) || ukefFacilityIds.includes(UKEF_ID.TEST)) {
      throw new Error(`Some UKEF facility ids were invalid when submitting deal ${dealId} for cancellation. No email has been sent`);
    }

    await this.sendDealCancellationEmail(cancelledDealUkefId.toString(), cancellation, ukefFacilityIds);
  }
}

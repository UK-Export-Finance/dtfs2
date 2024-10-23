import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { DATE_FORMATS, DEAL_TYPE, TEAMS, TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';
import { getUkefFacilityIds } from './helpers/get-ukef-facility-ids';

const { D_MMMM_YYYY } = DATE_FORMATS;

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
    try {
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
    } catch (error) {
      console.error('An error occurred in DealCancellationService.sendDealCancellationEmail', error);
      throw error;
    }
  }

  /**
   * Submit the deal cancellation
   * @param dealId the Deal ID
   * @param dealCancellation the deal cancellation object
   */
  public static async submitDealCancellation(dealId: string, dealCancellation: TfmDealCancellation) {
    try {
      // TODO: DTFS2-7298 - update cancellation in database & return cancelled deal/facility ids

      const { dealSnapshot } = await api.findOneDeal(dealId);
      const facilities = await api.findFacilitiesByDealId(dealId);

      const ukefDealId = dealSnapshot.dealType === DEAL_TYPE.BSS_EWCS ? dealSnapshot.details.ukefDealId : dealSnapshot.ukefDealId;

      const ukefFacilityIds = getUkefFacilityIds(facilities);

      if (!ukefFacilityIds.length) {
        throw new Error(`Failed to find facility ids on deal ${dealId} when submitting deal cancellation`);
      }

      await this.sendDealCancellationEmail(ukefDealId, dealCancellation, ukefFacilityIds);
    } catch (error) {
      console.error('An error occurred in DealCancellationService.submitDealCancellation', error);
      throw error;
    }
  }
}

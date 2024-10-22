import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { DATE_FORMATS, DEAL_TYPE, TEAMS, TfmDealCancellation, TfmFacility } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';
import { UKEF_ID } from '../../../constants/deals';

export class DealCancellationService {
  /**
   * Sends email to PIM email address confirming the cancellation has been submitted
   * @param ukefDealId ukef deal id
   * @param dealCancellation deal cancellation object
   * @param facilityIds ukef facility ids
   */
  private static async sendDealCancellationEmail(ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]) {
    const effectiveFromDate = toDate(dealCancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);

    if (!pimEmail) {
      throw Error('Failed to send deal cancellation email to PIM');
    }

    const emailTemplateId = isAfter(effectiveFromDate, endOfToday) ? CANCEL_DEAL_FUTURE_DATE : CANCEL_DEAL_PAST_DATE;

    const formattedEffectiveFromDate = format(dealCancellation.effectiveFrom, DATE_FORMATS.D_MMMM_YYYY);
    const formattedBankRequestDate = format(dealCancellation.bankRequestDate, DATE_FORMATS.D_MMMM_YYYY);

    await sendTfmEmail(emailTemplateId, pimEmail, {
      ukefDealId,
      effectiveFromDate: formattedEffectiveFromDate,
      bankRequestDate: formattedBankRequestDate,
      cancelReason: dealCancellation.reason || '-',
      formattedFacilitiesList: formatFacilityIds(facilityIds),
    });
  }

  /**
   * Maps the facilities objects into their UKEF ids
   * @param facilities Facilities
   * @returns UKEF facility Ids
   */
  private static getFacilityIds(facilities: TfmFacility[]): string[] {
    return facilities
      .map((facility) => facility.facilitySnapshot.ukefFacilityId)
      .filter((id): id is string => id !== null && id !== UKEF_ID.PENDING && id !== UKEF_ID.TEST);
  }

  /**
   * Submit the deal cancellation
   * @param dealId the Deal ID
   * @param dealCancellation the deal cancellation object
   */
  public static async submitDealCancellation(dealId: string, dealCancellation: TfmDealCancellation) {
    // TODO: DTFS2-7298 - update cancellation in database & return cancelled deal/facility ids

    const { dealSnapshot } = await api.findOneDeal(dealId);
    const facilities = await api.findFacilitiesByDealId(dealId);

    const ukefDealId = dealSnapshot.dealType === DEAL_TYPE.BSS_EWCS ? dealSnapshot.details.ukefDealId : dealSnapshot.ukefDealId;

    const ukefFacilityIds = this.getFacilityIds(facilities);

    if (!ukefFacilityIds.length) {
      throw new Error(`Failed to find facility ids on deal ${dealId} when submitting deal cancellation`);
    }

    await this.sendDealCancellationEmail(ukefDealId, dealCancellation, ukefFacilityIds);
  }
}

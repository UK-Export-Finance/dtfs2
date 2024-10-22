import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { DATE_FORMATS, TEAMS, TfmDealCancellation, TfmFacility } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';

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
  private static getFacilityIds(facilities: TfmFacility[]) {
    return facilities.map((facility) => facility.facilitySnapshot.ukefFacilityId).filter((id) => id !== null);
  }

  /**
   * Submit the deal cancellation
   * @param dealId the Deal ID
   * @param dealCancellation the deal cancellation object
   */
  public static async submitDealCancellation(dealId: string, dealCancellation: TfmDealCancellation) {
    // TODO: DTFS2-7298 - update cancellation in database & return cancelled deal/facility ids

    const {
      dealSnapshot: { ukefDealId },
    } = await api.findOneDeal(dealId);
    const facilities = await api.findFacilitiesByDealId(dealId);

    const ukefFacilityIds = this.getFacilityIds(facilities);

    await this.sendDealCancellationEmail(ukefDealId, dealCancellation, ukefFacilityIds);
  }
}

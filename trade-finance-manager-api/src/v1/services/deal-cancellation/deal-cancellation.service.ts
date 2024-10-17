import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { TEAMS, TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';

export class DealCancellationService {
  private static async sendDealCancellationEmail(ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]) {
    const effectiveFromDate = toDate(dealCancellation.effectiveFrom);
    const endOfToday = endOfDay(new Date());

    const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);

    const emailTemplateId = isAfter(effectiveFromDate, endOfToday) ? CANCEL_DEAL_FUTURE_DATE : CANCEL_DEAL_PAST_DATE;

    await sendTfmEmail(emailTemplateId, pimEmail, {
      ukefDealId,
      effectiveFromDate: format(dealCancellation.effectiveFrom, 'd MMMM yyyy'),
      bankRequestDate: format(dealCancellation.bankRequestDate, 'd MMMM yyyy'),
      cancelReason: dealCancellation.reason || '-',
      formattedFacilitiesList: formatFacilityIds(facilityIds),
    });
  }

  public static async submitDealCancellation(dealId: string, dealCancellation: TfmDealCancellation) {
    // TODO: DTFS2-7298 - update cancellation in database & return cancelled deal/facility ids

    const {
      dealSnapshot: { ukefDealId },
    } = await api.findOneDeal(dealId);
    const facilities = await api.findFacilitiesByDealId(dealId);

    const ukefFacilityIds = facilities.map((facility) => facility.facilitySnapshot.ukefFacilityId).filter((id) => id !== null);

    await this.sendDealCancellationEmail(ukefDealId, dealCancellation, ukefFacilityIds);
  }
}

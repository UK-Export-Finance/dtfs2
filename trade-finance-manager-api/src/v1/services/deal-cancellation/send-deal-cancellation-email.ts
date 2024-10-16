import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { TEAMS, TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { CANCEL_DEAL_PAST_DATE, CANCEL_DEAL_FUTURE_DATE } from '../../../constants/email-template-ids';
import * as api from '../../api';
import { formatFacilityIds } from './helpers/format-facility-ids';

export const sendDealCancellationEmail = async (ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]) => {
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
};

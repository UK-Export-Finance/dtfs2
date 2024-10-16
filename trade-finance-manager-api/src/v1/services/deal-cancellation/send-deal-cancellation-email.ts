import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { TEAMS, TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { DEAL_CANCELLED, DEAL_SCHEDULED_FOR_CANCELLATION } from '../../../constants/email-template-ids';
import * as api from '../../api';

const formatFacilityIds = (facilityIds: string[]) =>
  facilityIds.reduce((previousValue, currentValue, index) => `${previousValue}\n ${index + 1}. Facility ID ${currentValue}`);

export const sendDealCancellationEmail = async (ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]) => {
  const effectiveFromDate = toDate(dealCancellation.effectiveFrom);
  const endOfToday = endOfDay(new Date());

  const { email: pimEmail } = await api.findOneTeam(TEAMS.PIM.id);

  if (isAfter(effectiveFromDate, endOfToday)) {
    await sendTfmEmail(DEAL_SCHEDULED_FOR_CANCELLATION, pimEmail, {
      ukefDealId,
      effectiveFrom: format(dealCancellation.effectiveFrom, 'd MMMM yyyy'),
      bankRequestDate: format(dealCancellation.bankRequestDate, 'd MMMM yyyy'),
      reason: dealCancellation.reason || '-',
      facilitiesFormattedList: formatFacilityIds(facilityIds),
    });
  } else {
    await sendTfmEmail(DEAL_CANCELLED, pimEmail, {
      ukefDealId,
      effectiveFrom: format(dealCancellation.effectiveFrom, 'd MMMM yyyy'),
      bankRequestDate: format(dealCancellation.bankRequestDate, 'd MMMM yyyy'),
      reason: dealCancellation.reason || '-',
      facilitiesFormattedList: formatFacilityIds(facilityIds),
    });
  }
};

import { endOfDay, format, isAfter, toDate } from 'date-fns';
import { TfmDealCancellation } from '@ukef/dtfs2-common';
import sendTfmEmail from '../send-tfm-email';
import { DEAL_CANCELLED_FUTURE_EFFECTIVE_DATE } from '../../../constants/email-template-ids';

const formatFacilityIds = (facilityIds: string[]) =>
  facilityIds.reduce((previousValue, currentValue, index) => `${previousValue}\n ${index + 1}. Facility ID ${currentValue}`);

export const sendDealCancellationEmail = async (ukefDealId: string, dealCancellation: TfmDealCancellation, facilityIds: string[]) => {
  const effectiveFromDate = toDate(dealCancellation.effectiveFrom);
  const endOfToday = endOfDay(new Date());

  if (isAfter(effectiveFromDate, endOfToday)) {
    await sendTfmEmail(DEAL_CANCELLED_FUTURE_EFFECTIVE_DATE, process.env.PIM_EMAIL_ADDRESS, {
      ukefDealId,
      effectiveFrom: format(dealCancellation.effectiveFrom, 'd MMMM yyyy'),
      bankRequestDate: format(dealCancellation.bankRequestDate, 'd MMMM yyyy'),
      reason: dealCancellation.reason || '-',
      facilitiesFormattedList: formatFacilityIds(facilityIds),
    });
  } else {
    // TODO: DTFS2-7490 - send email if effective date is in the past
  }
};

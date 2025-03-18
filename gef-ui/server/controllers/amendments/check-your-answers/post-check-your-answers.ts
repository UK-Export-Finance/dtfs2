import { format, fromUnixTime } from 'date-fns';
import { CustomExpressRequest, PORTAL_AMENDMENT_STATUS, DATE_FORMATS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getNextPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { getCurrencySymbol } from '../facility-value/get-currency-symbol';

export type PostCheckYourAnswersRequest = CustomExpressRequest<{
  params: { facilityId: string; amendmentId: string; dealId: string };
}>;

/**
 * Controller to post check your answers page & submit the amendment to checker
 * @param req - The express request
 * @param res - The express response
 */
export const postCheckYourAnswers = async (req: PostCheckYourAnswersRequest, res: Response) => {
  try {
    const { facilityId, amendmentId, dealId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    if (!amendment) {
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    const {
      ukefDealId,
      bankInternalRefName,
      exporter: { companyName: exporterName },
    } = deal;

    const { ukefFacilityId } = facility;

    const { effectiveDate, changeFacilityValue, changeCoverEndDate, coverEndDate, value, isUsingFacilityEndDate, facilityEndDate } = amendment;

    // if effective date is defined, format it from unix timestamp (without ms) to DD MMMM YYYY, otherwise set it to '-'
    const formattedEffectiveDate = effectiveDate ? format(fromUnixTime(effectiveDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';
    // if changeCoverEndDate is true and coverEndDate is defined, format it to DD MMMM YYYY, otherwise set it to '-'
    const formattedCoverEndDate = changeCoverEndDate && coverEndDate ? format(new Date(coverEndDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';
    // if isUsingFacilityEndDate is true and facilityEndDate is defined, format it to DD MMMM YYYY, otherwise set it to '-'
    const formattedFacilityEndDate = isUsingFacilityEndDate && facilityEndDate ? format(new Date(facilityEndDate), DATE_FORMATS.DD_MMMM_YYYY) : '-';

    // default formattedFacilityValue
    let formattedFacilityValue = '-';

    /**
     * if changeFacilityValue is true and value is defined
     * get the currency symbol from the facility currency id
     * and set formattedFacilityValue to currency symbol + value
     */
    if (changeFacilityValue && value) {
      let currencySymbol = '';

      if (facility?.currency && facility.currency.id) {
        currencySymbol = getCurrencySymbol(facility?.currency.id);
      }
      formattedFacilityValue = `${currencySymbol}${value}`;
    }

    const updatedAmendment = await api.updateAmendmentStatus({
      facilityId,
      amendmentId,
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      userToken,
      sendToEmailAddress: user.email,
      exporterName,
      bankInternalRefName: bankInternalRefName!,
      ukefDealId,
      ukefFacilityId: ukefFacilityId!,
      recipientName: `${user.firstname} ${user.surname}`,
      dateEffectiveFrom: formattedEffectiveDate,
      newCoverEndDate: formattedCoverEndDate,
      newFacilityEndDate: formattedFacilityEndDate,
      newFacilityValue: formattedFacilityValue,
    });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.CHECK_YOUR_ANSWERS, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments check your answers page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

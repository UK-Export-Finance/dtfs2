import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { BankReviewDateViewModel } from '../../../types/view-models/amendments/bank-review-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { convertDateToDayMonthYearInput } from '../helpers/dates.helper.ts';

export type GetBankReviewDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the `Bank review date` page
 * @param req - the request object
 * @param res - the response object
 */
export const getBankReviewDate = async (req: GetBankReviewDateRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      console.error('User cannot amend facility %s on deal %s', facilityId, dealId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const amendment = await api.getAmendment({ facilityId, amendmentId, userToken });

    if (!amendment) {
      console.error('Amendment %s was not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!amendment.changeCoverEndDate) {
      console.error('Amendment %s is not changing the cover end date', amendmentId);
      return res.redirect(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
      );
    }

    if (amendment.isUsingFacilityEndDate !== false) {
      console.error('Amendment %s is not using bank review date', amendmentId);
      return res.redirect(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.DO_YOU_HAVE_A_FACILITY_END_DATE}`,
      );
    }

    const bankReviewDate = amendment.bankReviewDate && convertDateToDayMonthYearInput(amendment.bankReviewDate);

    const viewModel: BankReviewDateViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.BANK_REVIEW_DATE, amendment),
      bankReviewDate,
    };

    return res.render('partials/amendments/bank-review-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments bank review date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

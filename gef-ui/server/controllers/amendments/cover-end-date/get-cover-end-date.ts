import { CustomExpressRequest, DayMonthYearInput } from '@ukef/dtfs2-common';
import { fromUnixTime } from 'date-fns';
import { Response } from 'express';
import * as api from '../../../services/api';
import { CoverEndDateViewModel } from '../../../types/view-models/amendments/cover-end-date-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { convertDateToDayMonthYearInput } from '../helpers/dates.helper.ts';

export type GetCoverEndDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the Cover End Date page
 * @param req - the request object
 * @param res - the response object
 */
export const getCoverEndDate = async (req: GetCoverEndDateRequest, res: Response) => {
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
      console.error('Amendment %s not changing cover end date', amendmentId);
      return res.redirect(getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE }));
    }

    const currentCoverEndDate: Date | undefined = (amendment.coverEndDate && fromUnixTime(amendment.coverEndDate)) || undefined;

    const coverEndDateDayMonthYear: DayMonthYearInput | undefined = currentCoverEndDate && convertDateToDayMonthYearInput(currentCoverEndDate);

    const viewModel: CoverEndDateViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.COVER_END_DATE, amendment),
      coverEndDate: coverEndDateDayMonthYear,
    };

    return res.render('partials/amendments/cover-end-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments cover end date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

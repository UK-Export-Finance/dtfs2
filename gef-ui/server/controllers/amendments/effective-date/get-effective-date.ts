import { CustomExpressRequest, DayMonthYearInput, PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { fromUnixTime } from 'date-fns';
import * as api from '../../../services/api.js';
import { asLoggedInUserSession } from '../../../utils/express-session.ts';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper.ts';
import { getAmendmentsUrl, getPreviousPage } from '../helpers/navigation.helper.ts';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments.ts';
import { convertDateToDayMonthYearInput } from '../helpers/dates.helper.ts';
import { EffectiveDateViewModel } from '../../../types/view-models/amendments/effective-date-view-model.ts';

export type GetEffectiveDateRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  query: { change?: string };
}>;

/**
 * Controller to get the `Effective date` page
 * @param req - the request object
 * @param res - the response object
 */
export const getEffectiveDate = async (req: GetEffectiveDateRequest, res: Response) => {
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
      console.error('Amendment %s was not found for the facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!(PORTAL_AMENDMENT_ASSIGNED_TO_MAKER_STATUSES as string[]).includes(amendment.status)) {
      console.error('Amendment %s is not assigned to Maker', amendmentId);
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const effectiveDate: DayMonthYearInput | undefined = amendment.effectiveDate
      ? convertDateToDayMonthYearInput(fromUnixTime(amendment.effectiveDate))
      : undefined;
    const changeQuery = req.query?.change === 'true';
    const canMakerCancelAmendment = amendment.status === PORTAL_AMENDMENT_STATUS.DRAFT;

    const viewModel: EffectiveDateViewModel = {
      exporterName: deal.exporter.companyName,
      facilityType: facility.type,
      cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.EFFECTIVE_DATE, amendment, changeQuery),
      canMakerCancelAmendment,
      effectiveDate,
    };

    return res.render('partials/amendments/effective-date.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments effective date page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

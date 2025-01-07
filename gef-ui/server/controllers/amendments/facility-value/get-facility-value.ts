import { CURRENCY, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getCurrencySymbol } from './getCurrencySymbol';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';
import { getPreviousPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';

export type GetFacilityValueRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

/**
 * Controller to get the Facility Value page
 * @param req - the request object
 * @param res - the response object
 */
export const getFacilityValue = async (req: GetFacilityValueRequest, res: Response) => {
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
      console.error('Amendment %s not found on facility %s', amendmentId, facilityId);
      return res.redirect('/not-found');
    }

    if (!amendment.changeFacilityValue) {
      return res.redirect(
        `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/${PORTAL_AMENDMENT_PAGES.WHAT_DO_YOU_NEED_TO_CHANGE}`,
      );
    }

    const currencySymbol = getCurrencySymbol(facility.currency?.id ?? CURRENCY.GBP);

    const viewModel: FacilityValueViewModel = {
      exporterName: deal.exporter.companyName,
      cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
      previousPage: getPreviousPage(PORTAL_AMENDMENT_PAGES.FACILITY_VALUE, amendment),
      currencySymbol,
    };

    return res.render('partials/amendments/facility-value.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments facility value page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

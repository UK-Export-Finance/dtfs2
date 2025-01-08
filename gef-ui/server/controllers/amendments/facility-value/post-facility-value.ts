import { CURRENCY, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getCurrencySymbol } from './getCurrencySymbol';
import { getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateFacilityValue } from './validation';

export type PostFacilityValueRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
  reqBody: {
    facilityValue: string;
    previousPage: string;
  };
}>;

/**
 * Controller to post the Facility Value
 * @param req - the request object
 * @param res - the response object
 */
export const postFacilityValue = async (req: PostFacilityValueRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { facilityValue, previousPage } = req.body;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      console.error('Deal %s or Facility %s was not found', dealId, facilityId);
      return res.redirect('/not-found');
    }

    const validationErrors = validateFacilityValue(facilityValue);

    if (validationErrors) {
      const currencySymbol = getCurrencySymbol(facility.currency?.id ?? CURRENCY.GBP);

      const viewModel: FacilityValueViewModel = {
        exporterName: deal.exporter.companyName,
        cancelUrl: `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`,
        previousPage,
        currencySymbol,
      };

      return res.render('partials/amendments/facility-value.njk', viewModel);
    }

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update: { value: Number(facilityValue) }, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_VALUE, updatedAmendment));
  } catch (error) {
    console.error('Error getting amendments facility value page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

import { CURRENCY, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getCurrencySymbol } from './get-currency-symbol';
import { getAmendmentsUrl, getNextPage } from '../helpers/navigation.helper';
import { PORTAL_AMENDMENT_PAGES } from '../../../constants/amendments';
import { validateFacilityValue } from './validation';
import { validationErrorHandler } from '../../../utils/helpers';

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

    const validationErrorOrValue = validateFacilityValue(facilityValue);

    if ('errors' in validationErrorOrValue) {
      const currencySymbol = getCurrencySymbol(facility.currency?.id ?? CURRENCY.GBP);

      const viewModel: FacilityValueViewModel = {
        facilityValue,
        exporterName: deal.exporter.companyName,
        facilityType: facility.type,
        cancelUrl: getAmendmentsUrl({ dealId, facilityId, amendmentId, page: PORTAL_AMENDMENT_PAGES.CANCEL }),
        previousPage,
        currencySymbol,
        errors: validationErrorHandler(validationErrorOrValue.errors),
      };

      return res.render('partials/amendments/facility-value.njk', viewModel);
    }

    const update = { value: validationErrorOrValue.value };

    const updatedAmendment = await api.updateAmendment({ facilityId, amendmentId, update, userToken });

    return res.redirect(getNextPage(PORTAL_AMENDMENT_PAGES.FACILITY_VALUE, updatedAmendment));
  } catch (error) {
    console.error('Error posting amendments facility value page %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

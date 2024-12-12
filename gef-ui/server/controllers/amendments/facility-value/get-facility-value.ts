import { CURRENCY, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getCurrencySymbol } from './getCurrencySymbol';
import { userCanAmendFacility } from '../../../utils/facility-amendments.helper';

export type GetFacilityValueRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

export const getFacilityValue = async (req: GetFacilityValueRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken, user } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const { details: facility } = await api.getFacility({ facilityId, userToken });

    if (!deal || !facility) {
      return res.redirect('/not-found');
    }

    if (!userCanAmendFacility(facility, deal, user.roles)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    const currencySymbol = getCurrencySymbol(facility.currency?.id ?? CURRENCY.GBP);

    const viewModel: FacilityValueViewModel = {
      dealId,
      facilityId,
      amendmentId,
      exporterName: deal.exporter.companyName,
      previousPage: `/gef/application-details/${dealId}/facility/${facilityId}/amendments/${amendmentId}/bank-review-date`,
      currencySymbol,
    };

    return res.render('partials/amendments/facility-value.njk', viewModel);
  } catch (error) {
    console.error('Error getting amendments facility value page', error);
    return res.render('partials/problem-with-service.njk');
  }
};

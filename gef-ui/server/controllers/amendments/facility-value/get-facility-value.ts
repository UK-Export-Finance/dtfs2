import { CURRENCY, CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';
import * as api from '../../../services/api';
import { FacilityValueViewModel } from '../../../types/view-models/amendments/facility-value-view-model';
import { asLoggedInUserSession } from '../../../utils/express-session';
import { getCurrencySymbol } from './getCurrencySymbol';

export type GetFacilityValueRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

export const getFacilityValue = async (req: GetFacilityValueRequest, res: Response) => {
  try {
    const { dealId, facilityId, amendmentId } = req.params;
    const { userToken } = asLoggedInUserSession(req.session);

    const deal = await api.getApplication({ dealId, userToken });
    const facility = await api.getFacility({ facilityId, userToken });

    const currencySymbol = getCurrencySymbol(facility.details.currency?.id ?? CURRENCY.GBP);

    const viewModel: FacilityValueViewModel = {
      dealId,
      facilityId,
      amendmentId,
      exporterName: deal.exporter.companyName,
      facilityValue: 0,
      previousPage: `/case/${dealId}/facility/${facilityId}/amendments/${amendmentId}/bank-review-date`,
      currencySymbol,
    };

    return res.render('partials/amendments/facility-value.njk', viewModel);
  } catch (error) {
    console.error(error);
    return res.render('partials/problem-with-service.njk');
  }
};

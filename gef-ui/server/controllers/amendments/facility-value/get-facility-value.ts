import { CustomExpressRequest } from '@ukef/dtfs2-common';
import { Response } from 'express';

type GetFacilityValueRequest = CustomExpressRequest<{
  params: { dealId: string; facilityId: string; amendmentId: string };
}>;

export const getFacilityValue = (req: GetFacilityValueRequest, res: Response) => {
  return res.render('partials/amendments/facility-value.njk', {});
};

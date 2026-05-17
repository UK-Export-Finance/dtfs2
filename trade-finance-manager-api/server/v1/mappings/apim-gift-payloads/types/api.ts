import { TfmFacility } from '@ukef/dtfs2-common';
import { ApimGiftFacilityCreationPayload } from './apim-gift';
import { CreditRiskRating, FacilityCategory } from '../../../api-response-types';

type FindFacilitiesByDealIdErrorResponse = {
  status: number;
  data: unknown;
};

export type ApiTypes = {
  createGiftFacility: (facility: ApimGiftFacilityCreationPayload) => Promise<TfmFacility> | false;
  findFacilitiesByDealId: (dealId: string) => Promise<TfmFacility[] | FindFacilitiesByDealIdErrorResponse>;
  getCreditRiskRatings: () => Promise<CreditRiskRating[]> | false;
  getFacilityCategories: () => Promise<FacilityCategory[]> | false;
};

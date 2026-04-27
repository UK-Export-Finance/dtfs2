import { TfmFacility } from '@ukef/dtfs2-common';
import { ApimGiftFacilityCreationPayload } from './apim-gift';
import { CreditRiskRating, FacilityCategory } from '../../../api-response-types';

export type ApiTypes = {
  createGiftFacility: (facility: ApimGiftFacilityCreationPayload) => Promise<TfmFacility>;
  findFacilitiesByDealId: (dealId: string) => Promise<TfmFacility[]>;
  getCreditRiskRatings: () => Promise<CreditRiskRating[]>;
  getFacilityCategories: () => Promise<FacilityCategory[]>;
};

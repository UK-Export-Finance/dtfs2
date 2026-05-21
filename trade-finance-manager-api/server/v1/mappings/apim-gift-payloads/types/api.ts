import { TfmFacility } from '@ukef/dtfs2-common';
import { ApimGiftFacilityCreationPayload, ApimGiftFacilityAmendmentPayload } from './apim-gift';
import { CreditRiskRating, FacilityCategory } from '../../../api-response-types';

type FindFacilitiesByDealIdErrorResponse = {
  status: number;
  data: unknown;
};

type FindGiftFacilitiesByIdSuccessResponse = {
  facilities: object[];
};

export type ApiTypes = {
  createGiftFacility: (facility: ApimGiftFacilityCreationPayload) => Promise<TfmFacility> | false;
  amendGiftFacility: (facilityAmendmentData: ApimGiftFacilityAmendmentPayload, facilityId: string) => Promise<TfmFacility> | false;
  findFacilitiesByDealId: (dealId: string) => Promise<TfmFacility[] | FindFacilitiesByDealIdErrorResponse>;
  findGiftFacilitiesByIds: (facilityIdsQueryString: string) => Promise<FindGiftFacilitiesByIdSuccessResponse | false>;
  getCreditRiskRatings: () => Promise<CreditRiskRating[]> | false;
  getFacilityCategories: () => Promise<FacilityCategory[]> | false;
};

import { TfmFacility } from '@ukef/dtfs2-common';
import { ApimGiftFacilityCreationPayload } from './apim-gift';
import { CreditRiskRating, FacilityCategory } from '../../../api-response-types';
import { ApimGiftFacilityAmendmentPayload } from './amendments';

type FindFacilitiesByDealIdErrorResponse = {
  status: number;
  data: unknown;
};

type FindGiftFacilitiesByIdSuccessResponse = {
  facilities: object[];
};

type GiftAmendFacilityResponse = number;

export type ApiTypes = {
  createGiftFacility: (facility: ApimGiftFacilityCreationPayload) => Promise<TfmFacility> | false;
  amendGiftFacility: (facilityAmendmentData: ApimGiftFacilityAmendmentPayload, facilityId: string) => Promise<GiftAmendFacilityResponse> | false;
  findFacilitiesByDealId: (dealId: string) => Promise<TfmFacility[] | FindFacilitiesByDealIdErrorResponse>;
  findGiftFacilitiesByIds: (facilityIdsQueryString: string) => Promise<FindGiftFacilitiesByIdSuccessResponse | false>;
  getCreditRiskRatings: () => Promise<CreditRiskRating[]> | false;
  getFacilityCategories: () => Promise<FacilityCategory[]> | false;
};

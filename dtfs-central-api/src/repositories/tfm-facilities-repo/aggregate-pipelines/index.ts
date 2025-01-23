import { tfmAmendmentsByStatus } from './tfm-amendments-by-status';
import { amendmentsByFacilityId } from './amendments-by-facility-id';
import { amendmentsByDealId } from './amendments-by-deal-id';
import { tfmAmendmentsByFacilityIdAndStatus } from './tfm-amendments-by-facility-id-and-status';
import { tfmAmendmentsByDealIdAndStatus } from './tfm-amendments-by-deal-id-and-status';
import { latestCompletedTfmAmendmentByFacilityId } from './latest-completed-amendment-by-facility-id';
import { latestCompletedAmendmentByDealId } from './lastest-completed-amendment-by-deal-id';
import { allFacilitiesAndFacilityCount } from './all-facilities-and-facility-count';

export { AllFacilitiesAndFacilityCountAggregatePipelineOptions } from './all-facilities-and-facility-count';

export const aggregatePipelines = {
  tfmAmendmentsByStatus,
  amendmentsByFacilityId,
  amendmentsByDealId,
  tfmAmendmentsByFacilityIdAndStatus,
  tfmAmendmentsByDealIdAndStatus,
  latestCompletedTfmAmendmentByFacilityId,
  latestCompletedAmendmentByDealId,
  allFacilitiesAndFacilityCount,
};

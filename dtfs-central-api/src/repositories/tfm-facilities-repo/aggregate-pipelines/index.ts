import { amendmentsByStatus } from './amendments-by-status';
import { amendmentsByFacilityId } from './amendments-by-facility-id';
import { amendmentsByDealId } from './amendments-by-deal-id';
import { amendmentsByFacilityIdAndStatus } from './amendments-by-facility-id-and-status';
import { amendmentsByDealIdAndStatus } from './amendments-by-deal-id-and-status';
import { latestCompletedTfmAmendmentByFacilityId } from './latest-completed-amendment-by-facility-id';
import { latestCompletedAmendmentByDealId } from './lastest-completed-amendment-by-deal-id';
import { allFacilitiesAndFacilityCount } from './all-facilities-and-facility-count';

export { AllFacilitiesAndFacilityCountAggregatePipelineOptions } from './all-facilities-and-facility-count';

export const aggregatePipelines = {
  amendmentsByStatus,
  amendmentsByFacilityId,
  amendmentsByDealId,
  amendmentsByFacilityIdAndStatus,
  amendmentsByDealIdAndStatus,
  latestCompletedTfmAmendmentByFacilityId,
  latestCompletedAmendmentByDealId,
  allFacilitiesAndFacilityCount,
};

const gql = require('graphql-tag');

const allFacilitiesQuery = gql`
query allFacilities($start: Int, $pagesize: Int, $dealFilters: [DashboardFilters], $filters: [DashboardFilters]){
  allFacilities(params: {start: $start, pagesize: $pagesize, dealFilters: $dealFilters, filters: $filters}) {
    count
    facilities {
      _id
      name
      dealId
      ukefFacilityId
      type
      submissionType
      currency {
        id
      }
      value
      hasBeenIssued
      submittedAsIssuedDate
    }
  }
}`;

module.exports = allFacilitiesQuery;

const gql = require('graphql-tag');

const allFacilitiesQuery = gql`
query allFacilities($start: Int, $pagesize: Int, $filters: [FacilitiesFilters]){
  allFacilities(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    facilities {
      _id
      name
      dealId
      ukefFacilityId
      type
      submissionType
      value
      hasBeenIssued
    }
  }
}`;

module.exports = allFacilitiesQuery;

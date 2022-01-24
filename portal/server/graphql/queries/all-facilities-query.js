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

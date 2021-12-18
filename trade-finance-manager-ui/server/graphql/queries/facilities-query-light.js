const gql = require('graphql-tag');

const facilitiesLightQuery = gql`
query Facilities($searchString: String){
   facilities(params: {searchString: $searchString}) {
   tfmFacility {
      dealId
      facilityId
      ukefFacilityId
      facilityType
      companyName
      value
      coverEndDate
      dealType
      hasBeenIssued
      currency
   }
   }
}
`;

module.exports = facilitiesLightQuery;

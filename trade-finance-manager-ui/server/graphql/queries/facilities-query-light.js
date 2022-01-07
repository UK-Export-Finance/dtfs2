const gql = require('graphql-tag');

const facilitiesLightQuery = gql`
query Facilities($searchString: String){
   facilities(params: {searchString: $searchString}) {
   tfmFacilities {
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

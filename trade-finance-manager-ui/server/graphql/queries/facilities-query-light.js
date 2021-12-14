const gql = require('graphql-tag');

const facilitiesLightQuery = gql`
query Facilities($searchString: String){
   facilities(params: {searchString: $searchString}) {
   tfmFacilities {
      applicationId
      facilityId
      ukefFacilityId
      facilityType
      companyName
      facilityValue
      coverEndDate
      dealType
      hasBeenIssued
      currency
   }
   }
}
`;

module.exports = facilitiesLightQuery;

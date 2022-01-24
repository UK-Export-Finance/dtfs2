const gql = require('graphql-tag');

const facilitiesLightQuery = gql`
query Facilities($searchString: String){
   facilities(params: {searchString: $searchString}) {
   tfmFacilities {
      dealId
      facilityId
      ukefFacilityId
      type
      companyName
      coverEndDate
      coverEndDateEpoch
      dealType
      hasBeenIssued
      value
      currency
      currencyAndValue
   }
   }
}
`;

module.exports = facilitiesLightQuery;

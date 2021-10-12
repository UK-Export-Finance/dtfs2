const gql = require('graphql-tag');


// TODO: DealsByField should NOT be in here but only in full deals query
const dealsLightQuery = gql`
query DealsLight($searchString: String, $sortBy: DealsSortBy, $byField: [DealsByField], $start: Int, $pagesize: Int){
  dealsLight(params: {searchString: $searchString, sortBy: $sortBy, byField: $byField, start: $start, pagesize: $pagesize}) {
    count
    deals {
      _id
      tfm {
        product
        stage
        dateReceived
      }
      dealSnapshot {
        details {
          ukefDealId
          submissionType
          owningBank {
            name
          }
        }
        submissionDetails {
          supplierName
          buyerName
        }
      }
    }
  }
}
`;

module.exports = dealsLightQuery;

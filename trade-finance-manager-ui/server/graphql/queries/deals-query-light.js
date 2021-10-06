const gql = require('graphql-tag');

const dealsLightQuery = gql`
query DealsLight($searchString: String, $sortBy: DealsSortBy, $start: Int, $pagesize: Int){
  dealsLight(params: {searchString: $searchString, sortBy: $sortBy, start: $start, pagesize: $pagesize}) {
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

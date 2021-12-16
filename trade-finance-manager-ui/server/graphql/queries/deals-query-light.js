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
        submissionType
        details {
          ukefDealId
          owningBank {
            name
          }
        }
        submissionDetails {
          buyerName
        }
        exporter {
          companyName
        }
      }
    }
  }
}
`;

module.exports = dealsLightQuery;

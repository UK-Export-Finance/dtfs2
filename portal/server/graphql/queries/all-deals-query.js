const gql = require('graphql-tag');

const allDealsQuery = gql`
query allDeals($start: Int, $pagesize: Int, $filters: [DashboardFilters]){
  allDeals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      status
      bankInternalRefName
      exporter
      product
      submissionType
      updatedAt
    }
  }
}`;

module.exports = allDealsQuery;

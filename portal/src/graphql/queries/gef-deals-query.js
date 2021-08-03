import gql from 'graphql-tag';

const gefDealsQuery = gql`
query gefDeals($start: Int, $pagesize: Int, $filters: [DashboardFilters]){
  gefDeals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      bankInternalRefName
      status
      exporter {
        companyName
      }
      createdAt
      updatedAt
    }
  }
}`;

export default gefDealsQuery;

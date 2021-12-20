const gql = require('graphql-tag');

const dealsQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters:[DashboardFilters]){
  deals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      submissionType
      updatedAt
      bankSupplyContractID
      bankSupplyContractName
      details {
        status
        ukefDealId
        maker {
          username
          firstname
          surname
        }
        checker {
          username
          firstname
          surname
        }
        checkerMIN {
          username
          firstname
          surname
        }
        submissionDate
        approvalDate
        created
        owningBank{
          name
        }
        workflowStatus
      }
    }
  }
}`;

module.exports = dealsQuery;

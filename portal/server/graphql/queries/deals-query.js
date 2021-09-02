const gql = require('graphql-tag');

const dealsQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters:[DashboardFilters]){
  deals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals{
      _id
      details{
        status
        bankSupplyContractID
        bankSupplyContractName
        ukefDealId
        submissionType
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
        dateOfLastAction
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

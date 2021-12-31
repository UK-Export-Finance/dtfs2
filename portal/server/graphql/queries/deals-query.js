const gql = require('graphql-tag');

const dealsQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters:[DashboardFilters]){
  deals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals {
      _id
      submissionType
      bankInternalRefName
      additionalRefName
      updatedAt
      status
      bank {
        name
      }
      details {
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
        workflowStatus
      }
    }
  }
}`;

module.exports = dealsQuery;

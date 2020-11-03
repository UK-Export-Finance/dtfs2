import gql from 'graphql-tag';

//   deals(params: {start:0, pagesize: $pagesize, filter: [{field: "details.status", value: "Draft"}]}) {
const dealsQuery = `
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

export default gql(dealsQuery);

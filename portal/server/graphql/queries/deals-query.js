const gql = require('graphql-tag');

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
        checker
        dateOfLastAction
        submissionDate
        created
        owningBank{
          name
        }
      }
    }
  }
}`;

module.exports = gql(dealsQuery);

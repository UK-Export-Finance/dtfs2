const gql = require('graphql-tag');

const transactionsQuery = `
query Transactions($start: Int, $pagesize: Int, $filters:[TransactionFilters]){
  transactions(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    transactions{
      bankFacilityId
      ukefFacilityId
      transactionType
      facilityValue
      transactionStage
      issuedDate
      maker
      checker
    }
  }
}`;

module.exports = gql(transactionsQuery);

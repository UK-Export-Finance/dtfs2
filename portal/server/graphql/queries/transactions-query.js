const gql = require('graphql-tag');

const transactionsQuery = gql`
query Transactions($start: Int, $pagesize: Int, $filters:[TransactionFilters]){
  transactions(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    transactions{
      deal_id,
      deal_status,
      deal_supplierName,
      deal_bankInternalRefName,
      deal_ukefDealId,
      deal_bank,
      deal_created,
      deal_submissionDate,
      deal_submissionType,
      transaction_id,
      bankFacilityId,
      ukefFacilityId,
      transactionType,
      value,
      currency{
        text,
        id,
      }
      transactionStage,
      createdDate,
      lastEdited,
      issuedDate,
      maker,
      checker,
      issueFacilityDetailsSubmitted,
      requestedCoverStartDate,
      previousCoverStartDate,
      dateOfCoverChange,
      issuedFacilitySubmittedToUkefTimestamp,
      issuedFacilitySubmittedToUkefBy,
    }
  }
}`;

module.exports = transactionsQuery;

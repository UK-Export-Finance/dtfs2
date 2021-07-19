import gql from 'graphql-tag';

const transactionsQuery = gql`
query Transactions($start: Int, $pagesize: Int, $filters:[TransactionFilters]){
  transactions(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    transactions{
      deal_id,
      deal_status,
      deal_supplierName,
      deal_bankSupplyContractID,
      deal_ukefDealId,
      deal_owningBank,
      deal_created,
      deal_submissionDate,
      transaction_id,
      bankFacilityId,
      ukefFacilityId,
      transactionType,
      facilityValue,
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

export default transactionsQuery;

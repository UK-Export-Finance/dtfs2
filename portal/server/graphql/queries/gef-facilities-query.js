import gql from 'graphql-tag';

const gefFacilitiesQuery = gql`
query gefFacilities($start: Int, $pagesize: Int, $filters: [TransactionFilters]){
  gefFacilities(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    facilities {
      _id
      applicationId
      ukefFacilityId
      type
      value
      name
      currency
      hasBeenIssued
      submittedAsIssuedDate
      deal {
        _id
        bankId
        submissionType
      }
    }
  }
}`;

export default gefFacilitiesQuery;

// eslint-disable-next-line import/no-unresolved
import gql from 'graphql-tag';

const dealQuery = gql`
query Deals($start: Int, $pagesize: Int, $filters:[DashboardFilters]){
  deals(params: {start: $start, pagesize: $pagesize, filters: $filters}) {
    count
    deals{
      _id
      tfm {
        product
        stage
      }
      dealSnapshot{
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
        submissionDetails {
          supplierName
          supplyContractDescription
          destinationCountry
          supplyContractValue
          buyerName
          buyerAddressCountry
          buyerAddressLine1
          buyerAddressLine2
          buyerAddressLine3
          buyerAddressPostcode
          buyerAddressTown
          indemnifierAddressCountry
          indemnifierAddressLine1
          indemnifierAddressLine2
          indemnifierAddressLine3
          indemnifierAddressPostcode
          indemnifierAddressTown
          indemnifierCorrespondenceAddressCountry
          indemnifierCorrespondenceAddressLine1
          indemnifierCorrespondenceAddressLine2
          indemnifierCorrespondenceAddressLine3
          indemnifierCorrespondenceAddressPostcode
          indemnifierCorrespondenceAddressTown
          indemnifierName
          industryClass
          industrySector
          supplierAddressCountry
          supplierCountry
          supplierAddressLine1
          supplierAddressLine2
          supplierAddressLine3
          supplierAddressPostcode
          supplierAddressTown
          supplierCompaniesHouseRegistrationNumber
          supplierCorrespondenceAddressCountry
          supplierCorrespondenceAddressLine1
          supplierCorrespondenceAddressLine2
          supplierCorrespondenceAddressLine3
          supplierCorrespondenceAddressPostcode
          supplierCorrespondenceAddressTown
          smeType
        }
      }
    }
  }
}
`;

export default dealQuery;

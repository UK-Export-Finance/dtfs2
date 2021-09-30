// eslint-disable-next-line import/no-unresolved
import gql from 'graphql-tag';

// NOTE: this is not actually used by TFM UI.
// kept in place as an example.
// This returns more data than the dealsLight query
// and will be used be external systems.

const dealsQuery = gql`
query Deals($searchString: String, $sortBy: DealsSortBy, $start: Int, $pagesize: Int){
  deals(params: {searchString: $searchString, sortBy: $sortBy, start: $start, pagesize: $pagesize}) {
    count
    deals{
      _id
      tfm {
        dateReceived
        product
        stage
        history {
          tasks {
            timestamp
          }
        }
      }
      dealSnapshot {
        _id
        details {
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
          dateOfLastAction
          submissionDate
          approvalDate
          created
          owningBank{
            name
          }
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
        eligibility {
          agentAddressCountry {
            code
            name
          }
          agentAddressLine1
          agentAddressLine2
          agentAddressLine3
          agentAddressPostcode
          agentAddressTown
        }
        eligibilityCriteria {
          id
          answer
          description
        }
        dealFiles {
          security
        }
        totals {
          facilitiesValueInGBP
          facilitiesUkefExposure
        }
        facilities {
          facilitySnapshot {
            ukefFacilityID
            bankFacilityReference
            facilityValue
            facilityStage
            bondIssuer
            facilityProduct {
              code,
              name
            }
            facilityType
            facilityStage
            banksInterestMargin
            ukefExposure
            coveredPercentage
            firstDrawdownAmountInExportCurrency
            dates {
              inclusionNoticeReceived
              bankIssueNoticeReceived
              coverStartDate
              coverEndDate
              tenor
            }
          }
          tfm {
            bondBeneficiaryPartyUrn
            riskProfile
          }
        }
      }
    }
  }
}
`;

export default dealsQuery;

const gql = require('graphql-tag');

// NOTE: this is not actually used by TFM UI.
// This returns more data than the dealsLight query that TFM UI does not need.
// This query is used by external systems.

const dealsQuery = gql`
query Deals($searchString: String, $sortBy: DealsSortBy, $byField: [DealsByField], $start: Int, $pagesize: Int){
  deals(params: {searchString: $searchString, sortBy: $sortBy, byField: $byField, start: $start, pagesize: $pagesize}) {
    count
    deals {
      _id
      dealSnapshot {
        dealType
        submissionType
        updatedAt
        bankInternalRefName
        additionalRefName
        status
        bank {
          name
          emails
          partyUrn
        }
        maker {
          firstname
          surname
          email
        }
        details {
          ukefDealId
          submissionDate
          checker {
            firstname
            surname
          }
          submissionDate
          manualInclusionNoticeSubmissionDate
          approvalDate
          created
        }
        submissionDetails {
          supplierType
          supplierCompaniesHouseRegistrationNumber
          supplierName
          supplierCountry
          supplierAddressLine1
          supplierAddressLine2
          supplierAddressLine3
          supplierAddressPostcode
          supplierAddressTown
          industrySector
          industryClass
          supplyContractDescription
          indemnifierCompaniesHouseRegistrationNumber
          indemnifierCorrespondenceAddressCountry
          indemnifierCorrespondenceAddressLine1
          indemnifierCorrespondenceAddressLine2
          indemnifierCorrespondenceAddressLine3
          indemnifierCorrespondenceAddressPostcode
          indemnifierCorrespondenceAddressTown
          buyerName
          buyerAddressCountry
          buyerAddressLine1
          buyerAddressLine2
          buyerAddressLine3
          buyerAddressPostcode
          buyerAddressTown
          supplyContractValue
          supplyContractCurrency
        }
        eligibility {
          criteria {
            id
            answer
            text
            textList
          }
          agentAddressCountry {
            code
            name
          }
          agentAddressLine1
          agentAddressLine2
          agentAddressLine3
          agentAddressPostcode
          agentAddressTown
          agentName
          agentAlias
          lastUpdated
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
            _id,
            ukefFacilityId
            bankFacilityReference
            value
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
        facilitiesUpdated
      }
      tfm {
        dateReceived
        product
        stage
        underwriterManagersDecision {
          decision
          comments
          internalComments
          userFullName
          timestamp
        }
        exporterCreditRating
        probabilityOfDefault
        lossGivenDefault
      }
    }
  }
}

`;

module.exports = dealsQuery;

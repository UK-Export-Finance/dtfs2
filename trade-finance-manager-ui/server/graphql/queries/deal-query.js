const gql = require('graphql-tag');

const dealQuery = gql`
  query Deal($_id: String! $tasksFilters: TasksFilters $activityFilters: ActivityFilters) {
    deal(params: { _id: $_id, tasksFilters: $tasksFilters activityFilters: $activityFilters }) {
      _id
      tfm {
        product
        dateReceived
        parties {
          exporter {
            partyUrn
            partyUrnRequired
          }
          buyer {
            partyUrn
            partyUrnRequired
          }
          indemnifier {
            partyUrn
            partyUrnRequired
          }
          agent {
            partyUrn
            commissionRate
            partyUrnRequired
          }
        }
        activities {
          type
          timestamp
          text
          author {
            firstName
            lastName
            _id
          }
          label
        }
        tasks {
          groupTitle
          id
          groupTasks {
            id,
            groupId,
            title,
            status,
            assignedTo {
              userId,
              userFullName
            }
            team {
              id,
              name
            }
            canEdit
            dateStarted
            dateCompleted
          }
        }
        exporterCreditRating
        supplyContractValueInGBP
        stage
        lossGivenDefault
        probabilityOfDefault
        underwriterManagersDecision {
          decision
          comments
          internalComments
          timestamp
          userFullName
        }
        estore {
          siteName
          buyerName
          folderName
        }
        leadUnderwriter
      }
      dealSnapshot {
        _id,
        dealType
        submissionType
        bankInternalRefName
        additionalRefName
        status
        bank {
          name
          emails
        }
        maker {
          firstname
          surname
          email
        }
        details {
          ukefDealId
          submissionDate
        }
        supportingInformation {
          securityDetails {
            facility
            exporter
          }
        }
        totals {
          facilitiesValueInGBP,
          facilitiesUkefExposure
        }
        facilitiesUpdated
        facilities {
          _id,
          facilitySnapshot {
            _id,
            ukefFacilityId,
            dealId,
            facilityProduct {
              code
            },
            type,
            ukefFacilityType,
            facilityStage,
            facilityValueExportCurrency,
            value,
            coveredPercentage,
            bondIssuer,
            bondBeneficiary,
            bankFacilityReference,
            ukefExposure,
            banksInterestMargin,
            guaranteeFeePayableToUkef,
            firstDrawdownAmountInExportCurrency,
            dates {
              inclusionNoticeReceived,
              bankIssueNoticeReceived,
              coverStartDate,
              coverEndDate,
              tenor
            }
          },
          tfm {
            bondIssuerPartyUrn,
            bondBeneficiaryPartyUrn,
            exchangeRate,
            facilityValueInGBP,
            exposurePeriodInMonths,
            ukefExposure {
              exposure,
              timestamp
            }
            riskProfile
          }
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
        }
        submissionDetails {
          supplierName,
          supplyContractDescription,
          destinationCountry,
          supplyContractCurrency,
          supplyContractValue,
          buyerName,
          buyerAddressCountry,
          buyerAddressLine1,
          buyerAddressLine2,
          buyerAddressLine3,
          buyerAddressPostcode,
          buyerAddressTown,
          legallyDistinct,
          indemnifierCompaniesHouseRegistrationNumber,
          indemnifierAddressCountry,
          indemnifierAddressLine1,
          indemnifierAddressLine2,
          indemnifierAddressLine3,
          indemnifierAddressPostcode,
          indemnifierAddressTown,
          indemnifierCorrespondenceAddressCountry,
          indemnifierCorrespondenceAddressLine1,
          indemnifierCorrespondenceAddressLine2,
          indemnifierCorrespondenceAddressLine3,
          indemnifierCorrespondenceAddressPostcode,
          indemnifierCorrespondenceAddressTown,
          indemnifierName,
          industryClass,
          industrySector,
          supplierAddressCountry,
          supplierCountry,
          supplierAddressLine1,
          supplierAddressLine2,
          supplierAddressLine3,
          supplierAddressPostcode,
          supplierAddressTown,
          supplierCompaniesHouseRegistrationNumber,
          supplierCorrespondenceAddressLine1,
          supplierCorrespondenceAddressLine2,
          supplierCorrespondenceAddressLine3,
          supplierCorrespondenceAddressPostcode,
          supplierCorrespondenceAddressTown,
          supplierCorrespondenceAddressCountry,
          supplierType,
          smeType
        }
        exporter {
          companyName
        }
        isFinanceIncreasing
      }
    }
  }
`;

module.exports = dealQuery;

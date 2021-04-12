import gql from 'graphql-tag';

const dealQuery = gql`
  query Deal($_id: String! $tasksFilters: TasksFilters) {
    deal(params: { _id: $_id, tasksFilters: $tasksFilters }) {
      _id
      tfm {
        parties {
          exporter {
            partyUrn
          }
          buyer {
            partyUrn
          }
          indemnifier {
            partyUrn
          }
          agent {
            partyUrn
            commissionRate
          }
        }
        tasks {
          groupTitle
          groupTasks {
            id,
            title,
            status,
            lastEdited,
            assignedTo {
              userId
              userFullName
            }
            team {
              id,
              name
            }
            canEdit
          }
        }
        exporterCreditRating
        supplyContractValueInGBP
        stage
        lossGivenDefault
        probabilityOfDefault
      }
      dealSnapshot {
        _id,
        details {
          ukefDealId,
          status,
          submissionDate,
          submissionType,
          owningBank {
            name,
            emails
          },
          maker {
            firstname,
            surname,
            email,
          },
          bankSupplyContractID,
          bankSupplyContractName,
        }
        totals {
          facilitiesValueInGBP,
          facilitiesUkefExposure
        }
        facilities {
          _id,
          facilitySnapshot {
            _id,
            ukefFacilityID,
            facilityProduct {
              code
            },
            facilityType,
            ukefFacilityType,
            facilityStage,
            facilityValueExportCurrency,
            facilityValue,
            coveredPercentage,
            bondIssuer,
            bondBeneficiary,
            bankFacilityReference,
            ukefExposure,
            banksInterestMargin,
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
          agentAddressCountry {
            code
            name
          },
          agentAddressLine1,
          agentAddressLine2,
          agentAddressLine3,
          agentAddressPostcode,
          agentAddressTown,
          agentName,
          agentAlias
        }
        eligibilityCriteria {
          id,
          answer,
          description,
          descriptionList
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
          supplierCorrespondenceAddressCountry,
          supplierCorrespondenceAddressLine1,
          supplierCorrespondenceAddressLine2,
          supplierCorrespondenceAddressLine3,
          supplierCorrespondenceAddressPostcode,
          supplierCorrespondenceAddressTown,
          smeType
        }
      }
    }
  }
`;

export default dealQuery;

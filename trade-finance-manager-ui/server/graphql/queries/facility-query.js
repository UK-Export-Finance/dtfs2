import gql from 'graphql-tag';

const facilityQuery = gql`
  query Facility($id: ID!) {
    facility(_id: $id) {
      _id,
      facilitySnapshot {
        ukefFacilityID,
        associatedDealId,
        facilityProduct {
          name
        },
        facilityType,
        facilityStage,
        facilityValueExportCurrency,
        facilityValue,
        coveredPercentage,
        bankFacilityReference,
        guaranteeFeePayableToUkef,
        bondIssuer,
        bondBeneficiary,
        bankFacilityReference,
        ukefExposure,
        banksInterestMargin,
        firstDrawdownAmountInExportCurrency,
        feeType,
        feeFrequency,
        dayCountBasis,
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
        ukefExposure {
          exposure,
          timestamp
        },
        premiumSchedule {
          id
          calculationDate
          income
          incomePerDay
          exposure
          period
          daysInPeriod
          effectiveFrom
          effectiveTo
          created
          updated
          isAtive
        },
        premiumTotals
        creditRating
      }
    }
  }
`;

export default facilityQuery;

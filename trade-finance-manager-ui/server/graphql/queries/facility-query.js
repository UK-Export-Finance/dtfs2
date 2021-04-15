import gql from 'graphql-tag';

// TODO
// this is assuming all facility mappings we have atm
// will all be used in single facility query
// revisit and remove any unused fields, once single facility is built out more.

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
        premiumSchedule{
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
        creditRating
      }
    }
  }
`;

export default facilityQuery;

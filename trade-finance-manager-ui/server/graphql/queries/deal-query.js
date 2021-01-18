import gql from 'graphql-tag';

const dealQuery = gql`
  query Deal($id: ID!) {
    deal(_id: $id) {
      _id,
      details {
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
        },
        bankSupplyContractID,
        bankSupplyContractName,
      }
      facilities {
        _id,
        facilityProduct,
        facilityType,
        facilityValueExportCurrency,
        facilityValue,
        coverEndDate,
        ukefExposure,
        coveredPercentage
      }
      eligibility {
        agentAddressCountry,
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
`;

export default dealQuery;

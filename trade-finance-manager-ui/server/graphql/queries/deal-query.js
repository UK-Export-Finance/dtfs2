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
      submissionDetails {
        supplierName,
        supplyContractDescription,
        destinationCountry,
        supplyContractCurrency,
        supplyContractValue,
        buyerName
      }
      eligibilityCriteria {
        id,
        answer,
        description,
        descriptionList
      }
    }
  }
`;

export default dealQuery;

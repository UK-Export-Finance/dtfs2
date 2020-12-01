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
        }
      }
      submissionDetails {
        supplierName,
        supplyContractDescription,
        destinationCountry,
        supplyContractCurrency,
        supplyContractValue,
        buyerName
      }
    }
  }
`;

export default dealQuery;

import gql from 'graphql-tag';

const dealQuery = gql`
  query Deal($id: ID!) {
    deal(_id: $id) {
      _id,
      details {
        status,
        submissionType,
        owningBank {
          name,
          emails
        }
      }
      submissionDetails {
        supplierName,
        supplyContractDescription,
        destinationCountry
      }
    }
  }
`;

export default dealQuery;

const gql = require('graphql-tag');

const updatePartiesMutation = gql`
  mutation UpdateParties($id: ID!, $partyUpdate: TFMPartiesInput) {
    updateParties(_id: $id, partyUpdate: $partyUpdate) {
      parties {
        exporter {
          partyUrn
        }
      }
    }
  }
`;

module.exports = updatePartiesMutation;

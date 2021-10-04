const gql = require('graphql-tag');

const updateProbabilityOfDefault = gql`
  mutation UpdateProbabilityOfDefault($dealId: ID!, $probabilityOfDefaultUpdate: TFMProbabilityOfDefaultInput) {
    updateProbabilityOfDefault(dealId: $dealId, probabilityOfDefaultUpdate: $probabilityOfDefaultUpdate) {
      probabilityOfDefault
    }
  }
`;

module.exports = updateProbabilityOfDefault;

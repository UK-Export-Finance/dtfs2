const gql = require('graphql-tag');

const updateUnderwriterManagersDecision = gql`
  mutation UpdateUnderwriterManagersDecision($dealId: ID!, $managersDecisionUpdate: TFMUnderwriterManagersDecisionInput) {
    updateUnderwriterManagersDecision(dealId: $dealId, managersDecisionUpdate: $managersDecisionUpdate) {
      underwriterManagersDecision {
        decision
        comments
        internalComments
        userFullName
      }
    }
  }
`;

module.exports = updateUnderwriterManagersDecision;

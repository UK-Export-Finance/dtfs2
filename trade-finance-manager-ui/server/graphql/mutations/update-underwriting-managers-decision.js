import gql from 'graphql-tag';

const updateUnderwritingManagersDecision = gql`
  mutation UpdateUnderwritingManagersDecision($dealId: ID!, $managersDecisionUpdate: TFMUnderwriterManagersDecisionInput) {
    updateUnderwriterManagersDecision(dealId: $dealId, managersDecisionUpdate: $managersDecisionUpdate) {
      underwriterManagersDecision {
        decision
        comments
        internalComments
      }
    }
  }
`;

export default updateUnderwritingManagersDecision;

import gql from 'graphql-tag';

const updateLeadUnderwriterMutation = gql`
  mutation UpdateLeadUnderwriter($dealId: ID!, $leadUnderwriterUpdate: TFMLeadUnderwriterInput) {
    updateLeadUnderwriter(dealId: $dealId, leadUnderwriterUpdate: $leadUnderwriterUpdate) {
      userId
    }
  }
`;

export default updateLeadUnderwriterMutation;

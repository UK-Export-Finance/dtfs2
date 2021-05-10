import gql from 'graphql-tag';

const updateLossGivenDefault = gql`
  mutation UpdateLossGivenDefault($dealId: ID!, $lossGivenDefaultUpdate: TFMLossGivenDefaultInput) {
    updateLossGivenDefault(dealId: $dealId, lossGivenDefaultUpdate: $lossGivenDefaultUpdate) {
      lossGivenDefault
    }
  }
`;

export default updateLossGivenDefault;

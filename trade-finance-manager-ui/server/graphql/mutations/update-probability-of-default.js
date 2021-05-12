import gql from 'graphql-tag';

const updateProbabilityOfDefault = gql`
  mutation UpdateProbabilityOfDefault($dealId: ID!, $probabilityOfDefaultUpdate: TFMProbabilityOfDefaultInput) {
    updateProbabilityOfDefault(dealId: $dealId, probabilityOfDefaultUpdate: $probabilityOfDefaultUpdate) {
      probabilityOfDefault
    }
  }
`;

export default updateProbabilityOfDefault;

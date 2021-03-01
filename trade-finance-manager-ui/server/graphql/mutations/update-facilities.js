import gql from 'graphql-tag';

const updateFacilityMutation = gql`
  mutation UpdateFacility($id: ID!, $facilityUpdate: TFMFacilityInput) {
    updateFacility(_id: $id, facilityUpdate: $facilityUpdate) {
      bondIssuerPartyUrn
      bondBeneficiaryPartyUrn
    }
  }
`;

export default updateFacilityMutation;

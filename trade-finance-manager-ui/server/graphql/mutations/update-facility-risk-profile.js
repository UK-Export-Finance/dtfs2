const gql = require('graphql-tag');

const updateFacilityRiskProfileMutation = gql`
  mutation UpdateFacilityRiskProfile($id: ID!, $facilityUpdate: TFMFacilityRiskProfileInput) {
    updateFacilityRiskProfile(_id: $id, facilityUpdate: $facilityUpdate) {
      riskProfile
    }
  }
`;

module.exports = updateFacilityRiskProfileMutation;

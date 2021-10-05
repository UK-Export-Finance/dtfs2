const gql = require('graphql-tag');

const updateCreditRating = gql`
  mutation UpdateCreditRating($dealId: ID!, $creditRatingUpdate: TFMCreditRatingInput) {
    updateCreditRating(dealId: $dealId, creditRatingUpdate: $creditRatingUpdate) {
      exporterCreditRating
    }
  }
`;

module.exports = updateCreditRating;

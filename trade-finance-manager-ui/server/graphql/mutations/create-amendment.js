const gql = require('graphql-tag');

const createAmendmentMutation = gql`
    mutation createAmendment($id: ID!, $amendmentUpdate: TFMAmendmentInput) {
      createAmendment(_id: $id, amendmentUpdate: $amendmentUpdate) {
            amendments {
              requestDate
              timestamp
            }
        }
    }
`;

module.exports = createAmendmentMutation;

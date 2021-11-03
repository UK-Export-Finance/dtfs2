const gql = require('graphql-tag');

const updateCommentMutation = gql`
    mutation UpdateActivityComment($dealId: ID!, $commentUpdate: TFMActivityInput) {
        updateActivityComment(dealId: $dealId, commentUpdate: $commentUpdate) {
            type
            timestamp
            text
            author {
                firstName
                lastName
                _id
            }
        }
    }
`;

module.exports = updateCommentMutation;

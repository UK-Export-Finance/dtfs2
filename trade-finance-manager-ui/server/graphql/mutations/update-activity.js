const gql = require('graphql-tag');

const updateActivityMutation = gql`
    mutation UpdateActivity($dealId: ID!, $activityUpdate: TFMActivityInput) {
        updateActivity(dealId: $dealId, activityUpdate: $activityUpdate) {
            activities {
                type
                timestamp
                text
                author {
                    firstName
                    lastName
                    _id
                }
                label
            }
        }
    }
`;

module.exports = updateActivityMutation;

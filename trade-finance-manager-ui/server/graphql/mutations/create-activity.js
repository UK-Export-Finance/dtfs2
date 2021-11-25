const gql = require('graphql-tag');

const createActivityMutation = gql`
    mutation createActivity($dealId: ID!, $activityUpdate: TFMActivityInput) {
        createActivity(dealId: $dealId, activityUpdate: $activityUpdate) {
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

module.exports = createActivityMutation;

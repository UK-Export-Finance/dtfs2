const gql = require('graphql-tag');

const updateTaskMutation = gql`
  mutation UpdateTask($dealId: ID!, $taskUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, taskUpdate: $taskUpdate) {
      id
      groupId
      assignedTo {
        userId
      }
      updatedAt
      status
    }
  }
`;

module.exports = updateTaskMutation;

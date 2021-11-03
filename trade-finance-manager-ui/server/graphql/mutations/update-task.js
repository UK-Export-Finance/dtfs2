const gql = require('graphql-tag');

const updateTaskMutation = gql`
  mutation UpdateTask($dealId: ID!, $commentUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, commentUpdate: $taskUpdate) {
      id
      groupId
      assignedTo {
        userId
      }
      lastEdited
      status
    }
  }
`;

module.exports = updateTaskMutation;

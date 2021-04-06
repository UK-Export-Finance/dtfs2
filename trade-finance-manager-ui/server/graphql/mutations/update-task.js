import gql from 'graphql-tag';

const updateTaskMutation = gql`
  mutation UpdateTask($dealId: ID!, $taskUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, taskUpdate: $taskUpdate) {
      id
      assignedTo {
        userId
      }
      status
      history {
        statusFrom
        statusTo
        assignedUserId
        updatedBy
        timestamp
      }
    }
  }
`;

export default updateTaskMutation;

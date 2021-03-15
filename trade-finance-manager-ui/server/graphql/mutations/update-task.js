import gql from 'graphql-tag';

const updateTaskMutation = gql`
  mutation UpdateTask($dealId: ID!, $taskUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, taskUpdate: $taskUpdate) {
      assignedTo
      status
    }
  }
`;

export default updateTaskMutation;

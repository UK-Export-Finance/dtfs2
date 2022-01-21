const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

const MOCK_USER = MOCK_USERS[0];

const UPDATE_TASK = gql`
  mutation UpdateTask($dealId: ID!, $taskUpdate: TFMTaskInput) {
    updateTask(dealId: $dealId, taskUpdate: $taskUpdate) {
      id
      groupId
      assignedTo {
        userId
      }
      updatedAt
      status
      dateStarted
      dateCompleted
    }
  }
`;

describe('graphql mutation - update task', () => {
  let query;
  const baseTaskUpdate = {
    id: '1',
    groupId: 1,
    assignedTo: {
      userId: MOCK_USER._id,
    },
    urlOrigin: 'http://test.com',
  };

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });

    // use the test server to create a query function
    const { query: doQuery } = createTestClient(server);
    query = doQuery;
  });

  it('should return updated task', async () => {
    const taskUpdate = {
      ...baseTaskUpdate,
      status: 'Done',
      updatedBy: '123456789',
    };

    const { data } = await query({
      query: UPDATE_TASK,
      variables: {
        dealId: MOCK_DEAL._id,
        taskUpdate,
      },
    });

    const expected = {
      id: taskUpdate.id,
      groupId: taskUpdate.groupId,
      status: taskUpdate.status,
      assignedTo: {
        userId: taskUpdate.assignedTo.userId,
      },
      updatedAt: expect.any(Number),
      dateStarted: expect.any(String),
      dateCompleted: expect.any(String),
    };

    expect(data.updateTask).toEqual(expected);
  });

  it('deal history should be updated', async () => {
    const taskUpdate = {
      ...baseTaskUpdate,
      status: 'To do',
      updatedBy: 'DUMMY_USER_ID',
    };

    await query({
      query: UPDATE_TASK,
      variables: {
        dealId: MOCK_DEAL._id,
        taskUpdate,
      },
    });

    const GET_DEAL = gql`
      query Deal($_id: String! $tasksFilters: TasksFilters) {
        deal(params: { _id: $_id, tasksFilters: $tasksFilters }) {
          _id
          tfm { 
            history {
              tasks {
                taskId
                groupId
                statusFrom
                statusTo
                assignedUserId
                updatedBy
                timestamp
              }
            }
          }
        }
      }
    `;

    const { data } = await query({
      query: GET_DEAL,
      variables: { _id: MOCK_DEAL._id },
    });

    const expected = {
      taskId: taskUpdate.id,
      groupId: String(taskUpdate.groupId),
      statusFrom: 'To do',
      statusTo: taskUpdate.status,
      assignedUserId: taskUpdate.assignedTo.userId,
      updatedBy: taskUpdate.updatedBy,
      timestamp: expect.any(String),
    };

    expect(data.deal.tfm.history.tasks.length).toEqual(1);
    expect(data.deal.tfm.history.tasks[0]).toEqual(expected);
  });
});

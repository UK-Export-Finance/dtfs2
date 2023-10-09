const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');
const { mockFindOneDeal, mockFindUserById } = require('../src/v1/__mocks__/common-api-mocks');

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
  let server;
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

    server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });
  });

  beforeEach(() => {
    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.findUserById.mockReset();
    mockFindUserById();
  });
  
  afterAll(() => {
    api.findOneDeal.mockReset();
    api.findUserById.mockReset();
  });

  it('should return updated task', async () => {
    const taskUpdate = {
      ...baseTaskUpdate,
      status: 'Done',
      updatedBy: '123456789',
    };

    const { data } = await server.executeOperation({
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
      dateStarted: expect.any(Number),
      dateCompleted: expect.any(Number),
    };

    expect(data.updateTask).toEqual(expected);
  });
});

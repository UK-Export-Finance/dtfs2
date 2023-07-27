const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_ACTIVITY = gql`
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

describe('graphql mutation - update activity', () => {
  let server;

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });
  });

  it('should add a comment', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      updatedActivity: {
        type: 'COMMENT',
        timestamp: 1234342,
        text: 'test',
        author: {
          firstName: 'tester',
          lastName: 'testy',
          _id: '23231231231',
        },
      },
    };

    const { data } = await server.executeOperation({
      query: UPDATE_ACTIVITY,
      variables: mutationVars,
    });

    expect(typeof data.createActivity).toEqual('object');
  });
});

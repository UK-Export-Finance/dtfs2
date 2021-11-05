const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_ACTIVITY_COMMENT = gql`
mutation UpdateActivityComment($dealId: ID!, $commentUpdate: TFMActivityInput) {
    updateActivityComment(dealId: $dealId, commentUpdate: $commentUpdate) {
        activities {
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
}
`;

describe('graphql mutation - update activity comment', () => {
  let query;

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

  it('should add a comment', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      commentUpdate: {
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

    const { data } = await query({
      query: UPDATE_ACTIVITY_COMMENT,
      variables: mutationVars,
    });
    //console.log('----- graphqlResponse \n', graphqlResponse);
    expect(data.updateActivityComment).toEqual(mutationVars);
  });
});

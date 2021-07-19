const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const userReducer = require('../src/graphql/reducers/user');

const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

const MOCK_USER = MOCK_USERS[0];

const GET_USER = gql`
  query User($userId: String!) {
    user(userId: $userId) {
      _id
      firstName
      lastName
      email
    }
  }
`;

describe('graphql query - get user', () => {
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

  it('should return user via userReducer', async () => {
    const USER_ID = MOCK_USER._id;

    const { data } = await query({
      query: GET_USER,
      variables: { userId: USER_ID },
    });

    const expected = userReducer(MOCK_USER);

    expect(data.user).toEqual(expected);
  });
});

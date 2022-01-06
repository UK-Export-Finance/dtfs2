const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

const typeDefs = require('../../../src/graphql/schemas');
const resolvers = require('../../../src/graphql/resolvers');
const dealsReducer = require('../../../src/graphql/reducers/deals');
const { MOCK_DEALS } = require('../mocks/deals');

jest.mock('../../../src/v1/api', () => require('../mocks/api'));

const GET_DEALS = gql`
  query {
    deals {
      count
      deals {
        _id
        dealType
        submissionType
        status
        updatedAt
        bankInternalRefName
        bank {
          id
        }
      }
    }
  }
`;

describe('graphql query - deals', () => {
  let query;

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
      context: {
        user: {
          bank: { id: '9' },
        },
      },
    });

    // use the test server to create a query function
    const { query: doQuery } = createTestClient(server);
    query = doQuery;
  });

  it('should return deals', async () => {
    const { data } = await query({
      query: GET_DEALS,
    });

    expect(data.deals.count).toEqual(MOCK_DEALS.length);

    expect(data.deals.deals).toEqual(MOCK_DEALS);
  });
});

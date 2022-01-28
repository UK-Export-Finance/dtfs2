const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

const typeDefs = require('../../../src/graphql/schemas');
const resolvers = require('../../../src/graphql/resolvers');
const dealsReducer = require('../../../src/graphql/reducers/deals');
const { MOCK_ALL_DEALS } = require('../mocks/deals');

jest.mock('../../../src/v1/api', () => require('../mocks/api'));

const GET_DEALS = gql`
  query {
    allDeals {
      count
      deals {
        _id
        status
        bankInternalRefName
        exporter
        product
        submissionType
        updatedAt
      }
    }
  }
`;

describe('graphql query - allDeals', () => {
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

  it('should return deals via dealsReducer', async () => {
    const { data } = await query({
      query: GET_DEALS,
    });

    expect(data.allDeals.count).toEqual(MOCK_ALL_DEALS.length);

    const expected = dealsReducer(MOCK_ALL_DEALS);
    expect(data.allDeals.deals).toEqual(expected);
  });
});

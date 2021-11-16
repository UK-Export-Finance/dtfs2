const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_CREDIT_RATING = gql`
  mutation UpdateCreditRating($dealId: ID!, $creditRatingUpdate: TFMCreditRatingInput) {
    updateCreditRating(dealId: $dealId, creditRatingUpdate: $creditRatingUpdate) {
      exporterCreditRating
    }
  }
`;

describe('graphql mutation - update credit rating', () => {
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

  it('should return updated task', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      creditRatingUpdate: {
        exporterCreditRating: 'Good (BB-)',
      },
    };

    const { data } = await query({
      query: UPDATE_CREDIT_RATING,
      variables: mutationVars,
    });

    const expected = {
      exporterCreditRating: mutationVars.creditRatingUpdate.exporterCreditRating,
    };

    expect(data.updateCreditRating).toEqual(expected);
  });
});

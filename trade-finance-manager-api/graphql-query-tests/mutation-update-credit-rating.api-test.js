const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const { mockUpdateDeal } = require('../src/v1/__mocks__/common-api-mocks');

const UPDATE_CREDIT_RATING = gql`
  mutation UpdateCreditRating($dealId: ID!, $creditRatingUpdate: TFMCreditRatingInput) {
    updateCreditRating(dealId: $dealId, creditRatingUpdate: $creditRatingUpdate) {
      exporterCreditRating
    }
  }
`;

describe('graphql mutation - update credit rating', () => {
  let server;

  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });

    api.updateDeal.mockReset();
  });

  afterEach(() => {
    api.updateDeal.mockReset();
  });

  it('should return updated task', async () => {
    mockUpdateDeal();

    const mutationVars = {
      dealId: MOCK_DEAL._id,
      creditRatingUpdate: {
        exporterCreditRating: 'Good (BB-)',
      },
    };

    const { data } = await server.executeOperation({
      query: UPDATE_CREDIT_RATING,
      variables: mutationVars,
    });

    const expected = {
      exporterCreditRating: mutationVars.creditRatingUpdate.exporterCreditRating,
    };

    expect(data.updateCreditRating).toEqual(expected);
  });
});

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const { mockUpdateDeal } = require('../src/v1/__mocks__/common-api-mocks');

const UPDATE_LOSS_GIVEN_DEFAULT = gql`
  mutation UpdateLossGivenDefault($dealId: ID!, $lossGivenDefaultUpdate: TFMLossGivenDefaultInput) {
    updateLossGivenDefault(dealId: $dealId, lossGivenDefaultUpdate: $lossGivenDefaultUpdate) {
      lossGivenDefault
    }
  }
`;

describe('graphql mutation - update loss given default', () => {
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

  beforeEach(()=> {
    api.updateDeal.mockReset();
    mockUpdateDeal();
  })
  
  afterAll(() => {
    api.updateDeal.mockReset();
  });

  it('should return updated loss given default', async () => {

    const mutationVars = {
      dealId: MOCK_DEAL._id,
      lossGivenDefaultUpdate: {
        lossGivenDefault: 45,
      },
    };

    const { data } = await server.executeOperation({
      query: UPDATE_LOSS_GIVEN_DEFAULT,
      variables: mutationVars,
    });

    const expected = {
      lossGivenDefault: mutationVars.lossGivenDefaultUpdate.lossGivenDefault,
    };

    expect(data.updateLossGivenDefault).toEqual(expected);
  });
});

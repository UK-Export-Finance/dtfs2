const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const { mockUpdateDeal } = require('../src/v1/__mocks__/common-api-mocks');

const UPDATE_PROBABILITY_OF_DEFAULT = gql`
  mutation UpdateProbabilityOfDefault($dealId: ID!, $probabilityOfDefaultUpdate: TFMProbabilityOfDefaultInput) {
    updateProbabilityOfDefault(dealId: $dealId, probabilityOfDefaultUpdate: $probabilityOfDefaultUpdate) {
      probabilityOfDefault
    }
  }
`;

describe('graphql mutation - update probability of default', () => {
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

  it('should return updated probability of default', async () => {
    mockUpdateDeal();

    const mutationVars = {
      dealId: MOCK_DEAL._id,
      probabilityOfDefaultUpdate: {
        probabilityOfDefault: 45,
      },
    };

    const { data } = await server.executeOperation({
      query: UPDATE_PROBABILITY_OF_DEFAULT,
      variables: mutationVars,
    });

    const expected = {
      probabilityOfDefault: mutationVars.probabilityOfDefaultUpdate.probabilityOfDefault,
    };

    expect(data.updateProbabilityOfDefault).toEqual(expected);
  });
});

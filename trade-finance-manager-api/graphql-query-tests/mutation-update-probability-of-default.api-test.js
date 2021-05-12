const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_PROBABILITY_OF_DEFAULT = gql`
  mutation UpdateProbabilityOfDefault($dealId: ID!, $probabilityOfDefaultUpdate: TFMProbabilityOfDefaultInput) {
    updateProbabilityOfDefault(dealId: $dealId, probabilityOfDefaultUpdate: $probabilityOfDefaultUpdate) {
      probabilityOfDefault
    }
  }
`;

describe('graphql mutation - update probability of default', () => {
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

  it('should return updated probability of default', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      probabilityOfDefaultUpdate: {
        probabilityOfDefault: '45',
      },
    };

    const { data } = await query({
      query: UPDATE_PROBABILITY_OF_DEFAULT,
      variables: mutationVars,
    });

    const expected = {
      probabilityOfDefault: mutationVars.probabilityOfDefaultUpdate.probabilityOfDefault,
    };

    expect(data.updateProbabilityOfDefault).toEqual(expected);
  });
});

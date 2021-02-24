const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const facilityReducer = require('../src/graphql/reducers/facility');

const UPDATE_PARTIES = gql`
  mutation UpdateParties($id: ID!, $partyUpdate: TFMPartiesInput) {
    updateParties(_id: $id, partyUpdate: $partyUpdate) {
      parties {
        exporter {
          partyUrn
        }
      }
    }
  }
`;

describe('graphql query - update party', () => {
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

  it('should return updated party details', async () => {
    const partyUpdate = {
      exporter: {
        partyUrn: '111',
      },
    };

    const { data } = await query({
      query: UPDATE_PARTIES,
      variables: {
        id: '12345678',
        partyUpdate,
      },
    });

    expect(data.updateParties).toEqual({ parties: partyUpdate });
  });
});

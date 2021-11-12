const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const UPDATE_PARTIES = gql`
  mutation UpdateParties($id: ID!, $partyUpdate: TFMPartiesInput) {
    updateParties(_id: $id, partyUpdate: $partyUpdate) {
      parties {
        exporter {
          partyUrn
          partyUrnRequired
        }
        indemnifier {
          partyUrn
          partyUrnRequired
        }
      }
    }
  }
`;

describe('graphql mutation - update party', () => {
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

  describe('before all party URNs complete', () => {
    it('should return updated party details', async () => {
      const partyUpdate = {
        exporter: {
          partyUrn: '111',
          partyUrnRequired: true,
        },
        indemnifier: {
          partyUrn: '',
          partyUrnRequired: true,
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
});

const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const { mockUpdateDeal } = require('../src/v1/__mocks__/common-api-mocks');

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

  describe('before all party URNs complete', () => {
    it('should return updated party details', async () => {
      mockUpdateDeal();

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

      const { data } = await server.executeOperation({
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

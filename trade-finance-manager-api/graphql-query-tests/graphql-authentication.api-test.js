const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const graphqlPermissions = require('../src/graphql/middleware/graphql-permissions');
const graphqlKeyAuthentication = require('../src/graphql/key-authentication');
const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const apiToken = process.env.UKEF_TFM_API_SYSTEM_KEY;

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const GET_DEAL = gql`
  query Deal($_id: String!) {
    deal(params: { _id: $_id }) {
      _id
      dealSnapshot {
        _id
      }
    }
  }
`;

const UPDATE_PARTIES = gql`
  mutation UpdateParties($id: ID!, $partyUpdate: TFMPartiesInput) {
    updateParties(_id: $id, partyUpdate: $partyUpdate) {
      parties {
        exporter {
          partyUrn
          partyUrnRequired
        }
      }
    }
  }
`;

const partyUpdate = {
  exporter: {
    partyUrn: '111',
    partyUrnRequired: true,
  },
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
const schemaWithMiddleware = applyMiddleware(schema, graphqlPermissions);

describe('graphql query - authentication', () => {
  describe('missing authorisation key', () => {
    let query;
    beforeAll(() => {
      const req = {
        headers: {},
      };

      const server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),
      });

      // use the test server to create a query function
      const { query: doQuery } = createTestClient(server);
      query = doQuery;
    });

    it('GET - should return not authorised if missing auth key', async () => {
      const { data, errors } = await query({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
      });

      expect(data.deal).toEqual(null);
      expect(errors[0].message).toEqual('Not Authorised!');
    });

    it('MUTATE - should return not authorised if missing auth key', async () => {
      const { data, errors } = await query({
        query: UPDATE_PARTIES,
        variables: {
          id: '123456789',
          partyUpdate,
        },
      });

      expect(data.updateParties).toEqual(null);
      expect(errors[0].message).toEqual('Not Authorised!');
    });
  });

  describe('with REPORTS authorisation key (READ ONLY)', () => {
    let query;
    beforeAll(() => {
      const req = {
        headers: {
          authorization: process.env.UKEF_TFM_API_REPORTS_KEY,
        },
      };

      const server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),
      });

      // use the test server to create a query function
      const { query: doQuery } = createTestClient(server);
      query = doQuery;
    });

    it('GET - should return result', async () => {
      const { data, errors } = await query({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
        context: {
          headers: {
            Authorization: apiToken,
          },
        },
      });

      expect(data.deal.dealSnapshot._id).toEqual(MOCK_DEAL._id);
      expect(errors).toEqual(undefined);
    });

    it('MUTATE - should return not authorised', async () => {
      const { data, errors } = await query({
        query: UPDATE_PARTIES,
        variables: {
          id: MOCK_DEAL._id,
          partyUpdate,
        },
      });

      expect(data.updateParties).toEqual(null);
      expect(errors[0].message).toEqual('Not Authorised!');
    });
  });

  describe('with SYSTEM authorisation key (READ/WRITE)', () => {
    let query;

    beforeAll(() => {
      const req = {
        headers: {
          authorization: process.env.UKEF_TFM_API_SYSTEM_KEY,
        },
      };

      const server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),

      });

      // use the test server to create a query function
      const { query: doQuery } = createTestClient(server);
      query = doQuery;
    });

    it('GET - should return result', async () => {
      const { data, errors } = await query({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
        context: {
          headers: {
            Authorization: apiToken,
          },
        },
      });

      expect(data.deal.dealSnapshot._id).toEqual(MOCK_DEAL._id);
      expect(errors).toEqual(undefined);
    });

    it('MUTATE - should update and return result', async () => {
      const { data, errors } = await query({
        query: UPDATE_PARTIES,
        variables: {
          id: MOCK_DEAL._id,
          partyUpdate,
        },
      });

      expect(data.updateParties.parties).toEqual(partyUpdate);
      expect(errors).toEqual(undefined);
    });
  });
});

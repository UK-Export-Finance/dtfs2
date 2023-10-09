const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const graphqlPermissions = require('../src/graphql/middleware/graphql-permissions');
const graphqlKeyAuthentication = require('../src/graphql/key-authentication');
const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const api = require('../src/v1/api');

const apiToken = process.env.UKEF_TFM_API_SYSTEM_KEY;

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const { mockUpdateDeal, mockFindOneDeal } = require('../src/v1/__mocks__/common-api-mocks');

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
    let server;
    beforeAll(() => {
      const req = {
        headers: {},
      };

      server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),
      });
    });

    beforeEach(() => {
      api.getLatestCompletedAmendmentValue = jest.fn(() => Promise.resolve({}));
      api.getLatestCompletedAmendmentDate = jest.fn(() => Promise.resolve({}));
      api.getAmendmentById = jest.fn(() => Promise.resolve({}));
      
      api.updateDeal.mockReset();
      mockUpdateDeal();
      api.findOneDeal.mockReset();
      mockFindOneDeal();
    });

    afterEach(() => {
      api.updateDeal.mockReset();
      api.findOneDeal.mockReset();
    });

    it('GET - should return not authorised if missing auth key', async () => {
      const { data, errors } = await server.executeOperation({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
      });

      expect(data.deal).toEqual(null);
      expect(errors[0].message).toEqual('Not Authorised!');
    });

    it('MUTATE - should return not authorised if missing auth key', async () => {
      const { data, errors } = await server.executeOperation({
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
    let server;
    beforeAll(() => {
      const req = {
        headers: {
          authorization: process.env.UKEF_TFM_API_REPORTS_KEY,
        },
      };

      server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),
      });
    });

    it('GET - should return result', async () => {
      const { data, errors } = await server.executeOperation({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
        context: {
          headers: {
            Authorization: apiToken,
          },
        },
      });

      expect(data.deal.dealSnapshot._id).toEqual(MOCK_DEAL._id);
      expect(errors).toBeUndefined();
    });

    it('MUTATE - should return not authorised', async () => {
      const { data, errors } = await server.executeOperation({
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
    let server;

    beforeAll(() => {
      const req = {
        headers: {
          authorization: process.env.UKEF_TFM_API_SYSTEM_KEY,
        },
      };

      server = new ApolloServer({
        typeDefs,
        resolvers,
        schema: schemaWithMiddleware,
        context: () => ({
          graphqlPermissions: graphqlKeyAuthentication(req),
        }),
      });
    });

    it('GET - should return result', async () => {
      const { data, errors } = await server.executeOperation({
        query: GET_DEAL,
        variables: { _id: MOCK_DEAL._id },
        context: {
          headers: {
            Authorization: apiToken,
          },
        },
      });

      expect(data.deal.dealSnapshot._id).toEqual(MOCK_DEAL._id);
      expect(errors).toBeUndefined();
    });

    it('MUTATE - should update and return result', async () => {
      const { data, errors } = await server.executeOperation({
        query: UPDATE_PARTIES,
        variables: {
          id: MOCK_DEAL._id,
          partyUpdate,
        },
      });

      expect(data.updateParties.parties).toEqual(partyUpdate);
      expect(errors).toBeUndefined();
    });
  });
});

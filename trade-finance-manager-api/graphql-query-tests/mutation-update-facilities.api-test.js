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

const UPDATE_FACILITY = gql`
mutation UpdateFacility($id: ID!, $facilityUpdate: TFMFacilityInput) {
  updateFacility(_id: $id, facilityUpdate: $facilityUpdate) {
    bondIssuerPartyUrn
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
    const facilityUpdate = {
      bondIssuerPartyUrn: '111',
    };

    const { data } = await query({
      query: UPDATE_FACILITY,
      variables: {
        id: '12345678',
        facilityUpdate,
      },
    });

    expect(data.updateFacility).toEqual(facilityUpdate);
  });
});

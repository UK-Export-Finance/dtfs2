const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const UPDATE_FACILITY = gql`
mutation UpdateFacility($id: ID!, $facilityUpdate: TFMFacilityInput) {
  updateFacility(_id: $id, facilityUpdate: $facilityUpdate) {
    bondIssuerPartyUrn
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
  });

  it('should return updated party details', async () => {
    const facilityUpdate = {
      bondIssuerPartyUrn: '111',
    };

    const { data } = await server.executeOperation({
      query: UPDATE_FACILITY,
      variables: {
        id: '12345678',
        facilityUpdate,
      },
    });

    expect(data.updateFacility).toEqual(facilityUpdate);
  });
});

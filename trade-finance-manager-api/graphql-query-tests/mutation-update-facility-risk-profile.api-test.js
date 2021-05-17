const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const UPDATE_FACILITY_RISK_PROFILE = gql`
  mutation UpdateFacilityRiskProfile($id: ID!, $facilityUpdate: TFMFacilityRiskProfileInput) {
    updateFacilityRiskProfile(_id: $id, facilityUpdate: $facilityUpdate) {
      riskProfile
    }
  }
`;

describe('graphql mutation - update facility risk profile', () => {
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

  it('should return updated risk profile', async () => {
    const mutationVars = {
      id: '12345678',
      facilityUpdate: {
        riskProfile: 'Variable',
      },
    };

    const { data } = await query({
      query: UPDATE_FACILITY_RISK_PROFILE,
      variables: mutationVars,
    });

    const expected = {
      riskProfile: mutationVars.facilityUpdate.riskProfile,
    };

    expect(data.updateFacilityRiskProfile).toEqual(expected);
  });
});

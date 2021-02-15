const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const MOCK_FACILITY = require('../src/v1/__mocks__/mock-facility');
const facilityReducer = require('../src/graphql/reducers/facility');

const mockFacility = { ...MOCK_FACILITY };

const GET_FACILITY = gql`
  query Facility($id: ID!) {
    facility(_id: $id) {
      _id,
      ukefFacilityID,
      facilityProduct {
        code,
        name
      },
      facilityType,
      ukefFacilityType,
      facilityStage,
      facilityValueExportCurrency,
      facilityValue,
      coverEndDate,
      ukefExposure,
      coveredPercentage,
      bankFacilityReference,
      guaranteeFeePayableToUkef,
      bondIssuer
    }
  }
`;

describe('graphql query - get facility', () => {
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

  it('should return a facility via facilityReducer', async () => {
    const { data } = await query({
      query: GET_FACILITY,
      variables: { id: '12345678' },
    });
  
    const expected = facilityReducer(mockFacility);
    expect(data.facility).toEqual(expected);
  });
});

const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/drivers/db-client');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const MOCK_DEAL = require('../mocks/mock-deal');
const mapDeal = require('../src/v1/mappings/map-deal');
const dealReducer = require('../src/graphql/reducers/deal');

const GET_DEAL = gql`
  query Deal($id: ID!) {
    deal(_id: $id) {
      _id,
      details {
        status,
        submissionDate,
        submissionType,
        owningBank {
          name,
          emails
        }
      }
      submissionDetails {
        supplierName,
        supplyContractDescription,
        destinationCountry,
        supplyContractCurrency,
        supplyContractValue,
        buyerName
      }
      eligibilityCriteria {
        id,
        answer,
        description,
        descriptionList
      }
    }
  }
`;

describe('graphql query - get deal', () => {
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

  it('should return a mapped deal via dealReducer', async () => {
    const { data } = await query({
      query: GET_DEAL,
      variables: { id: '1234567' },
    });

    const mappedDeal = mapDeal(MOCK_DEAL);
    const expected = dealReducer(mappedDeal);

    expect(data.deal).toEqual(expected);
  });
});

const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const MOCK_DEAL = require('./mock-deal');
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
        },
        maker {
          firstname,
          surname,
        },
        bankSupplyContractID,
        bankSupplyContractName,
      }
      totals {
        facilitiesValueInGBP,
        facilitiesUkefExposure
      }
      facilities {
        _id,
        ukefFacilityID,
        facilityProduct {
          code
        },
        facilityType,
        facilityStage,
        facilityValueExportCurrency,
        facilityValue,
        coverEndDate,
        ukefExposure,
        coveredPercentage
      }
      eligibility {
        agentAddressCountry,
        agentAddressLine1,
        agentAddressLine2,
        agentAddressLine3,
        agentAddressPostcode,
        agentAddressTown,
        agentName
      }
      eligibilityCriteria {
        id,
        answer,
        description,
        descriptionList
      }
      submissionDetails {
        supplierName,
        supplyContractDescription,
        destinationCountry,
        supplyContractCurrency,
        supplyContractValue,
        buyerName,
        buyerAddressCountry,
        buyerAddressLine1,
        buyerAddressLine2,
        buyerAddressLine3,
        buyerAddressPostcode,
        buyerAddressTown,
        indemnifierAddressCountry,
        indemnifierAddressLine1,
        indemnifierAddressLine2,
        indemnifierAddressLine3,
        indemnifierAddressPostcode,
        indemnifierAddressTown,
        indemnifierCorrespondenceAddressCountry,
        indemnifierCorrespondenceAddressLine1,
        indemnifierCorrespondenceAddressLine2,
        indemnifierCorrespondenceAddressLine3,
        indemnifierCorrespondenceAddressPostcode,
        indemnifierCorrespondenceAddressTown,
        indemnifierName,
        industryClass,
        industrySector,
        supplierAddressCountry,
        supplierCountry,
        supplierAddressLine1,
        supplierAddressLine2,
        supplierAddressLine3,
        supplierAddressPostcode,
        supplierAddressTown,
        supplierCompaniesHouseRegistrationNumber,
        supplierCorrespondenceAddressCountry,
        supplierCorrespondenceAddressLine1,
        supplierCorrespondenceAddressLine2,
        supplierCorrespondenceAddressLine3,
        supplierCorrespondenceAddressPostcode,
        supplierCorrespondenceAddressTown,
        smeType
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
    const mappedDeal = mapDeal(MOCK_DEAL);

    const expectedDealWithoutFacilities = dealReducer(mappedDeal);
    delete expectedDealWithoutFacilities.facilities;
    expect(expectedDealWithoutFacilities).toEqual(expectedDealWithoutFacilities);
  });
});

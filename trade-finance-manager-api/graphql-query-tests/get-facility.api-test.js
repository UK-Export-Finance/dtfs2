const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const MOCK_FACILITIES = require('../src/v1/__mocks__/mock-facilities');
const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const facilityReducer = require('../src/graphql/reducers/facility');

const mockFacilityTfm = {
  ukefExposure: '1,234.00',
  ukefExposureCalculationTimestamp: '1606900616651',
  facilityValueInGBP: '123,45.00',
  bondIssuerPartyUrn: '456-test',
  bondBeneficiaryPartyUrn: '123-test',
};

const mockFacility = {
  ...MOCK_FACILITIES[0],
  tfm: mockFacilityTfm,
};

const mockDealDetails = MOCK_DEAL.details;

const mockDealTfm = {
  exporterCreditRating: 'Good (BB-)',
};

const initFacilityShape = {
  facilitySnapshot: mockFacility,
  tfm: mockFacility.tfm,
};

const GET_FACILITY = gql`
  query Facility($id: ID!) {
    facility(_id: $id) {
      _id,
      facilitySnapshot {
        _id
        ukefFacilityID,
        associatedDealId,
        facilityProduct {
          code,
          name
        },
        facilityType,
        ukefFacilityType,
        facilityStage,
        facilityValueExportCurrency,
        facilityValue,
        ukefExposure,
        coveredPercentage,
        bankFacilityReference,
        guaranteeFeePayableToUkef,
        bondIssuer,
        bondBeneficiary,
        ukefExposure,
        banksInterestMargin,
        firstDrawdownAmountInExportCurrency,
        feeType,
        feeFrequency,
        dayCountBasis,
        dates {
          inclusionNoticeReceived,
          bankIssueNoticeReceived,
          coverStartDate,
          coverEndDate,
          tenor
        }
      },
      tfm {
        bondIssuerPartyUrn,
        bondBeneficiaryPartyUrn,
        facilityValueInGBP,
        ukefExposure {
          exposure,
          timestamp
        },
        creditRating
      }
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

    const reducerResult = facilityReducer(initFacilityShape, mockDealDetails, mockDealTfm);

    expect(data.facility._id).toEqual(MOCK_FACILITIES[0]._id);
    expect(data.facility.facilitySnapshot).toEqual(reducerResult.facilitySnapshot);

    // remove fields that would be in the data/DB, but not defined in the schema.
    const expectedTfmFacilityShape = reducerResult.tfm;
    delete expectedTfmFacilityShape.ukefExposureCalculationTimestamp;

    expect(data.facility.tfm).toEqual(expectedTfmFacilityShape);
  });
});

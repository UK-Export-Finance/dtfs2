const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const { MOCK_FACILITIES } = require('../src/v1/__mocks__/mock-facilities');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../src/v1/__mocks__/mock-cash-contingent-facilities');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const MOCK_GEF_DEAL = require('../src/v1/__mocks__/mock-gef-deal');
const facilityReducer = require('../src/graphql/reducers/facility');

const mockFacilityTfm = {
  ukefExposure: '1,234.00',
  ukefExposureCalculationTimestamp: '1606900616651',
  facilityValueInGBP: '123,45.00',
  bondIssuerPartyUrn: '456-test',
  bondBeneficiaryPartyUrn: '123-test',
};

const mockDealTfm = {
  exporterCreditRating: 'Good (BB-)',
};

const GET_FACILITY = gql`
  query Facility($id: ID!) {
    facility(_id: $id) {
      _id,
      facilitySnapshot {
        _id
        ukefFacilityId
        ukefFacilityType
        dealId
        facilityProduct {
          code
          name
        }
        hasBeenIssued
        type
        facilityStage
        facilityValueExportCurrency
        value
        coveredPercentage
        bankFacilityReference
        guaranteeFeePayableToUkef
        bondIssuer
        bondBeneficiary
        bankFacilityReference
        ukefExposure
        banksInterestMargin
        firstDrawdownAmountInExportCurrency
        currency
        feeType
        feeFrequency
        dayCountBasis
        providedOn
        providedOnOther
        dates {
          inclusionNoticeReceived
          bankIssueNoticeReceived
          coverStartDate
          coverEndDate
          tenor
        }
      }
      tfm {
        bondIssuerPartyUrn
        bondBeneficiaryPartyUrn
        facilityValueInGBP
        ukefExposure {
          exposure
          timestamp
        }
        premiumSchedule {
          id
          calculationDate
          income
          incomePerDay
          exposure
          period
          daysInPeriod
          effectiveFrom
          effectiveTo
          created
          updated
          isAtive
        }
        premiumTotals
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

  it('should return a BSS/EWCS facility via facilityReducer', async () => {
    const { data } = await query({
      query: GET_FACILITY,
      variables: { id: MOCK_FACILITIES[0]._id },
    });

    const mockFacility = {
      ...MOCK_FACILITIES[0],
      tfm: mockFacilityTfm,
    };

    const initFacilityShape = {
      facilitySnapshot: mockFacility,
      tfm: mockFacility.tfm,
    };

    const reducerResult = facilityReducer(
      initFacilityShape,
      MOCK_DEAL,
      mockDealTfm,
    );

    expect(data.facility._id).toEqual(MOCK_FACILITIES[0]._id);

    const expectedSnapshot = {
      ...reducerResult.facilitySnapshot,
      // these fields are in the query, but only specific to GEF facilities.
      providedOn: null,
      providedOnOther: null,
    };

    expect(data.facility.facilitySnapshot).toEqual(expectedSnapshot);

    // remove fields that would be in the data/DB, but not defined in the schema.
    const expectedTfmFacilityShape = reducerResult.tfm;
    delete expectedTfmFacilityShape.ukefExposureCalculationTimestamp;

    expect(data.facility.tfm).toEqual(expectedTfmFacilityShape);
  });

  it('should return a Cash/Contingent facility via facilityReducer', async () => {
    const { data } = await query({
      query: GET_FACILITY,
      variables: { id: MOCK_CASH_CONTINGENT_FACILITIES[0]._id },
    });

    const mockFacility = {
      ...MOCK_CASH_CONTINGENT_FACILITIES[0],
      tfm: mockFacilityTfm,
    };

    const initFacilityShape = {
      _id: mockFacility._id,
      facilitySnapshot: mockFacility,
      tfm: mockFacility.tfm,
    };

    const reducerResult = facilityReducer(initFacilityShape, MOCK_GEF_DEAL, mockDealTfm);

    expect(data.facility._id).toEqual(MOCK_CASH_CONTINGENT_FACILITIES[0]._id);

    const expectedSnapshot = {
      ...reducerResult.facilitySnapshot,

      // These fields are in the query, but only specific to BSS/EWCS.
      bondBeneficiary: null,
      bondIssuer: null,
      firstDrawdownAmountInExportCurrency: null,
    };

    expect(data.facility.facilitySnapshot).toEqual(expectedSnapshot);

    // remove fields that would be in the data/DB, but not defined in the schema.
    const expectedTfmFacilityShape = reducerResult.tfm;
    delete expectedTfmFacilityShape.ukefExposureCalculationTimestamp;

    expect(data.facility.tfm).toEqual(reducerResult.tfm);
  });
});

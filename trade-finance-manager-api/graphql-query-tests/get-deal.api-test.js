const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const mapDeal = require('../src/v1/mappings/map-deal');
const dealReducer = require('../src/graphql/reducers/deal');

const MOCK_DEAL_TFM = {
  exporterCreditRating: 'Good (BB-)',
  lossGivenDefault: '50%',
  stage: 'Confirmed',
  history: {
    tasks: [],
  },
};

const GET_DEAL = gql`
  query Deal($_id: String! $tasksFilters: TasksFilters) {
    deal(params: { _id: $_id, tasksFilters: $tasksFilters }) {
      _id
      tfm {
        parties {
          exporter {
            partyUrn
          }
          buyer {
            partyUrn
          }
          indemnifier {
            partyUrn
          }
          agent {
            partyUrn
            commissionRate
          }
        }
        tasks {
          groupTitle
          id
          groupTasks {
            id,
            groupId,
            title,
            status,
            assignedTo {
              userId,
              userFullName
            }
            team {
              id,
              name
            }
            canEdit
            dateStarted
            dateCompleted
          }
        }
        exporterCreditRating
        supplyContractValueInGBP
        lossGivenDefault
        probabilityOfDefault
        stage
        underwriterManagersDecision {
          decision
          comments
          internalComments
          timestamp
          userFullName
        }
        leadUnderwriter
      }
      dealSnapshot {
        _id,
        details {
          ukefDealId,
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
            email,
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
          facilitySnapshot {
            _id,
            ukefFacilityID,
            facilityProduct {
              code
            },
            facilityType,
            ukefFacilityType,
            facilityStage,
            facilityValueExportCurrency,
            facilityValue,
            coveredPercentage,
            bondIssuer,
            bondBeneficiary,
            bankFacilityReference,
            ukefExposure,
            banksInterestMargin,
            firstDrawdownAmountInExportCurrency,
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
            exposurePeriodInMonths,
            ukefExposure {
              exposure,
              timestamp
            }
          }
        }
        eligibility {
          agentAddressCountry {
            code
            name
          },
          agentAddressLine1,
          agentAddressLine2,
          agentAddressLine3,
          agentAddressPostcode,
          agentAddressTown,
          agentName,
          agentAlias
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
          legallyDistinct,
          indemnifierCompaniesHouseRegistrationNumber,
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
    const mappedDeal = await mapDeal(MOCK_DEAL);

    const expectedDealWithoutFacilities = dealReducer({
      dealSnapshot: mappedDeal,
      tfm: MOCK_DEAL_TFM,
    });
    delete expectedDealWithoutFacilities.facilities;
    expect(expectedDealWithoutFacilities).toEqual(expectedDealWithoutFacilities);
  });
});

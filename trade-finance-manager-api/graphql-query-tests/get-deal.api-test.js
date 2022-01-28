const { makeExecutableSchema } = require('@graphql-tools/schema');

const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const mapDeal = require('../src/v1/mappings/map-deal');
const dealReducer = require('../src/graphql/reducers/deal');

const MOCK_AUTHOR = {
  firstName: 'tester',
  lastName: 'smith',
  _id: 12243343242342,
};

const MOCK_DEAL_TFM = {
  exporterCreditRating: 'Good (BB-)',
  lossGivenDefault: '50%',
  stage: 'Confirmed',
  history: {
    tasks: [],
  },
  activities: [{
    type: 'COMMENT',
    timestamp: 13345665,
    text: 'test1',
    author: MOCK_AUTHOR,
    label: 'Comment added',
  }],
};

const GET_DEAL = gql`
query Deal($_id: String! $tasksFilters: TasksFilters $activityFilters: ActivityFilters) {
  deal(params: { _id: $_id, tasksFilters: $tasksFilters activityFilters: $activityFilters }) {
    _id
    tfm {
      product
      dateReceived
      lastUpdated
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
      activities {
        type
        timestamp
        text
        author {
          firstName
          lastName
          _id
        }
        label
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
      stage
      lossGivenDefault
      probabilityOfDefault
      underwriterManagersDecision {
        decision
        comments
        internalComments
        timestamp
        userFullName
      }
      estore {
        siteName
        buyerName
        folderName
      }
      leadUnderwriter
    }
    dealSnapshot {
      _id,
      dealType
      submissionType
      bankInternalRefName
      additionalRefName
      status,
      bank {
        name,
        emails
      },
      maker {
        firstname,
        surname,
        email,
      }
      details {
        ukefDealId,
        submissionDate,
      }
      dealFiles {
        security
      }
      totals {
        facilitiesValueInGBP,
        facilitiesUkefExposure
      }
      facilitiesUpdated
      facilities {
        _id,
        facilitySnapshot {
          _id,
          ukefFacilityId,
          dealId,
          facilityProduct {
            code
          },
          type,
          ukefFacilityType,
          facilityStage,
          facilityValueExportCurrency,
          value,
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
          riskProfile
        }
      }
      eligibility {
        criteria {
          id
          answer
          text
          textList
        }
        agentAddressCountry {
          code
          name
        }
        agentAddressLine1
        agentAddressLine2
        agentAddressLine3
        agentAddressPostcode
        agentAddressTown
        agentName
        agentAlias
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
        supplierCorrespondenceAddressLine1,
        supplierCorrespondenceAddressLine2,
        supplierCorrespondenceAddressLine3,
        supplierCorrespondenceAddressPostcode,
        supplierCorrespondenceAddressTown,
        supplierCorrespondenceAddressCountry,
        supplierType,
        smeType
      }
      isFinanceIncreasing
    }
  }
}
`;

describe('graphql query - get deal', () => {
  beforeAll(() => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const schemaWithMiddleware = applyMiddleware(schema);

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      schema: schemaWithMiddleware,
    });

    // use the test server to create a query function
    createTestClient(server);
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

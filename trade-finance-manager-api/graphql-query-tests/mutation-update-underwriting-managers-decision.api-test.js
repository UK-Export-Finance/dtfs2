const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

const externalApis = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');

const UPDATE_UNDERWRITING_MANAGERS_DECISION = gql`
  mutation UpdateUnderwriterManagersDecision($dealId: ID!, $managersDecisionUpdate: TFMUnderwriterManagersDecisionInput) {
    updateUnderwriterManagersDecision(dealId: $dealId, managersDecisionUpdate: $managersDecisionUpdate) {
      underwriterManagersDecision {
        decision
        comments
        internalComments
        userFullName
        timestamp
      }
    }
  }
`;

describe('graphql mutation - update underwriting managers decision', () => {
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

    externalApis.updatePortalBssDealStatus = jest.fn();
  });

  beforeEach(() => {
    externalApis.getLatestCompletedAmendment = () => Promise.resolve({});
  });

  it('should return updated decision with timestamp', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      managersDecisionUpdate: {
        decision: 'Approved without conditions',
        comments: 'Test comment',
        internalComments: 'Internal comment',
        userFullName: 'Test User',
      },
    };

    const { data } = await query({
      query: UPDATE_UNDERWRITING_MANAGERS_DECISION,
      variables: mutationVars,
    });

    const expected = {
      underwriterManagersDecision: {
        decision: mutationVars.managersDecisionUpdate.decision,
        comments: mutationVars.managersDecisionUpdate.comments,
        internalComments: mutationVars.managersDecisionUpdate.internalComments,
        userFullName: mutationVars.managersDecisionUpdate.userFullName,
        timestamp: expect.any(String),
      },
    };

    expect(data.updateUnderwriterManagersDecision).toEqual(expected);
  });

  it('deal stage should be updated', async () => {
    const mutationVars = {
      dealId: MOCK_DEAL._id,
      managersDecisionUpdate: {
        decision: 'Approve without conditions',
        comments: 'Test comment',
        internalComments: 'Internal comment',
        userFullName: 'Test User',
      },
    };

    await query({
      query: UPDATE_UNDERWRITING_MANAGERS_DECISION,
      variables: mutationVars,
    });

    const GET_DEAL = gql`
      query Deal($_id: String! $tasksFilters: TasksFilters) {
        deal(params: { _id: $_id, tasksFilters: $tasksFilters }) {
          _id
          tfm {
            stage
          }
        }
      }
    `;

    const { data } = await query({
      query: GET_DEAL,
      variables: { _id: MOCK_DEAL._id },
    });

    expect(data.deal.tfm.stage).toEqual(mutationVars.managersDecisionUpdate.decision);
  });
});

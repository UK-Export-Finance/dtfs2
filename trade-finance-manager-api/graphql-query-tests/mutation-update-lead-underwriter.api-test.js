const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');
const api = require('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');

const MOCK_DEAL = require('../src/v1/__mocks__/mock-deal');
const MOCK_USERS = require('../src/v1/__mocks__/mock-users');
const { mockUpdateDeal, mockFindOneDeal, mockFindUserById } = require('../src/v1/__mocks__/common-api-mocks');

const MOCK_USER = MOCK_USERS[0];

const UPDATE_LEAD_UNDERWRITER = gql`
  mutation UpdateLeadUnderwriter($dealId: ID!, $leadUnderwriterUpdate: TFMLeadUnderwriterInput) {
    updateLeadUnderwriter(dealId: $dealId, leadUnderwriterUpdate: $leadUnderwriterUpdate) {
      leadUnderwriter
    }
  }
`;

describe('graphql mutation - update lead underwriter', () => {
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

  beforeEach(() => {
    api.updateDeal.mockReset();
    mockUpdateDeal();

    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.findUserById.mockReset();
    mockFindUserById();
  });

  afterAll(() => {
    api.updateDeal.mockReset();
    api.findOneDeal.mockReset();
    api.findUserById.mockReset();
  });

  it('should return updated leadUnderwriter', async () => {
    const leadUnderwriterUpdate = {
      userId: MOCK_USER._id,
    };

    const { data } = await server.executeOperation({
      query: UPDATE_LEAD_UNDERWRITER,
      variables: {
        dealId: MOCK_DEAL._id,
        leadUnderwriterUpdate,
      },
    });

    const expected = {
      leadUnderwriter: leadUnderwriterUpdate.userId,
    };

    expect(data.updateLeadUnderwriter).toEqual(expected);
  });
});

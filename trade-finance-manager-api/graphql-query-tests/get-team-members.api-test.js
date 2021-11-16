const { createTestClient } = require('apollo-server-testing');
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require('graphql-middleware');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const gql = require('graphql-tag');

jest.mock('../src/v1/api');

const typeDefs = require('../src/graphql/schemas');
const resolvers = require('../src/graphql/resolvers');
const teamMembersReducer = require('../src/graphql/reducers/teamMembers');

const MOCK_USERS = require('../src/v1/__mocks__/mock-users');

const GET_TEAM_MEMBERS = gql`
  query TeamMembers($teamId: String!) {
    teamMembers(teamId: $teamId) {
      _id
      firstName
      lastName
    }
  }
`;

describe('graphql query - get team members', () => {
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

  it('should return team members via teamMembersReducer', async () => {
    const TEAM_ID = 'BUSINESS_SUPPORT';

    const { data } = await query({
      query: GET_TEAM_MEMBERS,
      variables: { teamId: TEAM_ID },
    });

    const expectedTeamMembers = MOCK_USERS.filter((u) => u.teams.includes(TEAM_ID));

    const expectedTeamMembersStripped = teamMembersReducer(expectedTeamMembers);

    expect(data.teamMembers).toEqual(expectedTeamMembersStripped);
  });
});

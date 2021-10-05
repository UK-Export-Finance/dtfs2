const gql = require('graphql-tag');

const teamMembersQuery = gql`
  query TeamMembers($teamId: String!) {
    teamMembers(teamId: $teamId) {
      _id
      firstName
      lastName
    }
  }
`;

module.exports = teamMembersQuery;

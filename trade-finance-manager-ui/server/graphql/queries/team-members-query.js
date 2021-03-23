// eslint-disable-next-line import/no-unresolved
import gql from 'graphql-tag';

const teamMembersQuery = gql`
  query TeamMembers($teamId: String!) {
    teamMembers(teamId: $teamId) {
      _id
      firstName
      lastName
    }
  }
`;

export default teamMembersQuery;

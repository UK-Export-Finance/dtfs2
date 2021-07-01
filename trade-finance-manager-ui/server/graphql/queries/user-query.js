// eslint-disable-next-line import/no-unresolved
import gql from 'graphql-tag';

const userQuery = gql`
  query User($userId: String!) {
    user(userId: $userId) {
      _id
      firstName
      lastName
    }
  }
`;

export default userQuery;

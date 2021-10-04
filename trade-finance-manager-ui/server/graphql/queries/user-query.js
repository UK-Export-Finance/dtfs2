const gql = require('graphql-tag');

const userQuery = gql`
  query User($userId: String!) {
    user(userId: $userId) {
      _id
      firstName
      lastName
      email
    }
  }
`;

module.exports = userQuery;

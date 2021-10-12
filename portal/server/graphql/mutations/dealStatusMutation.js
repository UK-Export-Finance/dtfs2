const gql = require('graphql-tag');

const dealStatusUpdate = gql(`
mutation DealStatus($dealId: String, $status: String, $comments: String){
  dealStatusUpdate(dealId: $dealId, status: $status, comments: $comments) {
    status
    comments
    success
    statusCode
    errorList {
      comments {
        text
      }
    }
    count
  }
}`);

module.exports = dealStatusUpdate;

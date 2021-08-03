import gql from 'graphql-tag';

const dealStatusUpdate = `
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
}`;


export default gql(dealStatusUpdate);

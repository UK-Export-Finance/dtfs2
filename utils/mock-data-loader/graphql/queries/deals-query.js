const gql = require('graphql-tag');

//   deals(params: {start:0, pagesize: $pagesize, filter: [{field: "details.status", value: "Draft"}]}) {
const dealsQuery = `
query {
  deals {
    deals{
      _id
    }
  }
}`;

module.exports = gql(dealsQuery);

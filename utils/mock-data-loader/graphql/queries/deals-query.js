const gql = require('graphql-tag');

//   deals(params: {start:0, pagesize: $pagesize, filter: [{field: "status", value: "Draft"}]}) {
const dealsQuery = `
query {
  allDeals {
    count
    deals {
      _id
      product
    }
  }
}`;

module.exports = gql(dealsQuery);

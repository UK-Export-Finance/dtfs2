const dealsQuery = `
query {
  allDeals {
    deals {
      _id
      product
    }
  }
}`;

module.exports = dealsQuery;

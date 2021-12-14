const dealsQuery = `
query {
  deals {
    deals {
      _id
      dealType
    }
  }
}`;

module.exports = dealsQuery;

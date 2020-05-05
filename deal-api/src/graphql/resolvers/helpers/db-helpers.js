const createDbQuery = (operator, value) => ({
  [`$${operator}`]: value,
});

module.exports = {
  createDbQuery,
};

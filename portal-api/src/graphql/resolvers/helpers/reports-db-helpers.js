const createDbQuery = (operator, value) => {
  console.log('create db query - reports db helper. value : ', value);
  return {
    [`$${operator}`]: value,
  };
};

module.exports = {
  createDbQuery,
};

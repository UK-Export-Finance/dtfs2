const isHttpErrorStatus = (status) => ![200, 201].includes(status);
module.exports = {
  isHttpErrorStatus,
};

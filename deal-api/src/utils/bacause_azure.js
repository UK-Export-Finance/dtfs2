const getEnv = (str) => process.env(str) || process.env(`CUSTOMCONNSTR_${str}`);

module.exports = {
  getEnv,
};

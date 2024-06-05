const { ALL_BANKS_ID } = require('../constants');

const isSuperUser = (user) => user && user.bank && user.bank.id === ALL_BANKS_ID;

module.exports = isSuperUser;

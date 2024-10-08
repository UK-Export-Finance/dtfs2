const api = require('../api');

let banks;

const initBanks = async (token) => {
  banks = await api.listBanks(token);
  return banks;
};

const getBankByName = (bankData, bankName) => {
  const bank = bankData.find((b) => b.name.toLowerCase() === bankName.toLowerCase());
  if (!bank) return {};
  return {
    id: bank.id,
    name: bank.name,
    emails: bank.emails,
  };
};

module.exports = {
  initBanks,
  getBankByName,
};

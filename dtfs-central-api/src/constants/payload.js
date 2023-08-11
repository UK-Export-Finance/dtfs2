const BANK = {
  id: String,
  name: String,
  mga: Object,
  emails: Object,
  companiesHouseNo: String,
  partyUrn: String,
};

const USER = {
  username: String,
  password: String,
  firstname: String,
  surname: String,
  email: String,
  timezone: String,
  roles: Object,
  bank: Object,
};

module.exports = {
  BANK,
  USER
};

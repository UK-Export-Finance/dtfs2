// Connection URL
const user = encodeURIComponent("<todo>");
const password = encodeURIComponent("<todo>");
const authMechanism = "DEFAULT";

module.exports = {
  url: `mongodb://${user}:${password}@localhost:27017/?authMechanism=${authMechanism}`
};

/* ACBS needs party names split into 3 fields:
  name1: chars 1-35
  name2: chars 36-70
  name3: chars 71-105
*/
const getPartyNames = (partyName) => ({
  name1: partyName.substring(0, 35),
  name2: partyName.substring(35, 70),
  name3: partyName.substring(70, 105),
});

module.exports = getPartyNames;

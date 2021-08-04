// temporarily map facilities as they are for initial dev
// TODO: generic facility structure for all facilities (cash, contingent, bonds, loans)

const mapBssEwcsFacility = (facility) => ({
  ...facility,
  coverStartDate: facility.requestedCoverStartDate,
  tfm: facility.tfm,
});

module.exports = mapBssEwcsFacility;

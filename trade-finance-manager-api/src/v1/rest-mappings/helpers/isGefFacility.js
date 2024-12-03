const { FACILITY_TYPE } = require('@ukef/dtfs2-common');

const isGefFacility = (type) => type === FACILITY_TYPE.CASH || type === FACILITY_TYPE.CONTINGENT;

module.exports = isGefFacility;

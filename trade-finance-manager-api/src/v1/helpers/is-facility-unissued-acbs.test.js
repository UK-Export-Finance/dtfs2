const isUnissuedInACBS = require('./is-facility-unissued-acbs');
const { FACILITIES } = require('../../constants');

describe('isIssuedInACBS', () => {
  const codes = [FACILITIES.ACBS_FACILITY_STAGE.ISSUED, FACILITIES.ACBS_FACILITY_STAGE.RISK_EXPIRED, '00', '', '!"£', 123, undefined, null, {}, []];

  it('Should return true when the facility stage code is `06`', () => {
    const result = isUnissuedInACBS(FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT);

    expect(result).toEqual(true);
  });

  it.each(codes)('Should return false when the facility stage code is not `06`', (code) => {
    const result = isUnissuedInACBS(code);

    expect(result).toEqual(false);
  });
});

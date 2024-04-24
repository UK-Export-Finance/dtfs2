const isIssuedInACBS = require('./is-issued-acbs');
const { FACILITIES } = require('../../constants');

describe('isIssuedInACBS', () => {
  const codes = [
    FACILITIES.ACBS_FACILITY_STAGE.COMMITMENT,
    FACILITIES.ACBS_FACILITY_STAGE.RISK_EXPIRED,
    '00',
    '',
    '!"£',
    123,
    undefined,
    null,
    {},
    [],
  ];

  it('Should return true when the facility stage code is `07`', () => {
    const result = isIssuedInACBS(FACILITIES.ACBS_FACILITY_STAGE.ISSUED);

    expect(result).toEqual(true);
  });

  it.each(codes)('Should return false when the facility stage code is not `07`', (code) => {
    const result = isIssuedInACBS(code);

    expect(result).toEqual(false);
  });
});

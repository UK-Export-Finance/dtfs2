const k2Map = require('../../../../src/v1/controllers/integration/helpers/k2-mapping');

describe('Maps portal data to k2 data', () => {
  const k2Value = 'draft';

  it('returns given value if data type doesn\'t exist', () => {
    const portalValue = k2Map.findPortalValue('INVALID_DATA_TYPE', '', k2Value);
    expect(portalValue).toEqual(k2Value);
  });

  it('returns given value if data field doesn\'t exist', () => {
    const portalValue = k2Map.findPortalValue('DEAL', 'INVALID_FIELD', k2Value);
    expect(portalValue).toEqual(k2Value);
  });

  it('returns given value if data field value doesn\'t exist', () => {
    const portalValue = k2Map.findPortalValue('DEAL', 'SME_TYPE', 'invalid_value');
    expect(portalValue).toEqual('invalid_value');
  });

  it('returns portal value of mapped k2 value ', () => {
    const portalValue = k2Map.findPortalValue('DEAL', 'STATUS', 'submission_acknowledged');
    expect(portalValue).toEqual('Acknowledged by UKEF');
  });
});

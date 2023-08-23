const mapFacilityStage = require('./mapFacilityStage');

describe('mapFacilityStage', () => {
  describe('when facilityStage is `Issued`', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapFacilityStage('Issued');
      expect(result).toEqual('Issued');
    });
  });

  describe('when facilityStage is `Unconditional`', () => {
    it('should return facilityStage as `Issued`', () => {
      const result = mapFacilityStage('Unconditional');
      expect(result).toEqual('Issued');
    });
  });

  describe('when facilityStage is true boolean', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapFacilityStage(true);
      expect(result).toEqual('Issued');
    });
  });

  describe('when facilityStage is `Unissued`', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapFacilityStage('Unissued');
      expect(result).toEqual('Commitment');
    });
  });

  describe('when facilityStage is `Conditional`', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapFacilityStage('Conditional');
      expect(result).toEqual('Commitment');
    });
  });

  describe('when facilityStage is false boolean', () => {
    it('should return facilityStage as `Commitment`', () => {
      const result = mapFacilityStage(false);
      expect(result).toEqual('Commitment');
    });
  });
});

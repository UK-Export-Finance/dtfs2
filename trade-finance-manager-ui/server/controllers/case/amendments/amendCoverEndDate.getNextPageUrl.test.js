const { getNextPageUrl } = require('./amendCoverEndDate.controller');

describe('amendCoverEndDate.getNextPageUrl', () => {
  const baseUrl = '/base-url';
  const defaultValues = {
    changeFacilityValue: false,
    showFacilityEndDatePage: false,
    baseUrl,
  };
  describe('if showFacilityEndDatePage is true', () => {
    it('should return the facility end date page url', () => {
      const result = getNextPageUrl({ ...defaultValues, showFacilityEndDatePage: true });

      expect(result).toEqual(`${baseUrl}/is-using-facility-end-date`);
    });
  });

  describe('if changeFacilityValue is true', () => {
    it('should return the facility value page url', () => {
      const result = getNextPageUrl({ ...defaultValues, changeFacilityValue: true });

      expect(result).toEqual(`${baseUrl}/facility-value`);
    });
  });

  describe('if showFacilityEndDatePage and changeFacilityValue are true', () => {
    it('should return the facility end date page url', () => {
      const result = getNextPageUrl({ ...defaultValues, showFacilityEndDatePage: true, changeFacilityValue: true });

      expect(result).toEqual(`${baseUrl}/is-using-facility-end-date`);
    });
  });

  describe('if showFacilityEndDatePage and changeFacilityValue are false', () => {
    it('should return the check answers page url', () => {
      const result = getNextPageUrl({ ...defaultValues, showFacilityEndDatePage: false, changeFacilityValue: false });

      expect(result).toEqual(`${baseUrl}/check-answers`);
    });
  });
});

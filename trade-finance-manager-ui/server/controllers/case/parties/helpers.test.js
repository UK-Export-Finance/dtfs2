import userCanEdit from './helpers';

describe('case - parties - helpers', () => {
  describe('userCanEdit', () => {
    it('should return true', () => {
      const result = userCanEdit({
        firstName: 'Joe',
        lastName: 'Bloggs',
        teams: ['BUSINESS_SUPPORT'],
      });

      expect(result).toEqual(true);
    });

    describe('when user is NOT in BUSINESS_SUPPORT team', () => {
      it('should return false', () => {
        const result = userCanEdit({
          firstName: 'Joe',
          lastName: 'Bloggs',
          teams: ['UNDERWRITERS'],
        });

        expect(result).toEqual(false);
      });
    });
  });
});

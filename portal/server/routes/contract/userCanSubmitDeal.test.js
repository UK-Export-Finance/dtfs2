import userCanSubmitDeal from './userCanSubmitDeal';

describe('userCanSubmitDeal', () => {
  describe('when deal has `Submitted` status', () => {
    it('should return false', () => {
      const deal = {
        details: {
          status: 'Submitted',
        },
      };

      const result = userCanSubmitDeal(deal);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker', () => {
    it('should return true', () => {
      const deal = {
        details: {
          maker: {},
        },
      };
      const user = { roles: ['maker'] };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(true);
    });
  });

  describe('when user is a checker', () => {
    it('should return true', () => {
      const deal = {
        details: {
          maker: {},
        },
      };
      const user = { roles: ['checker'] };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(true);
    });
  });

  describe('when user is a maker AND checker that has created the deal', () => {
    it('should return false', () => {
      const deal = {
        details: {
          maker: {
            _id: '1234',
          },
        },
      };

      const user = {
        roles: ['maker', 'checker'],
        _id: '1234',
      };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker AND checker that has edited the deal', () => {
    it('should return false', () => {
      const deal = {
        details: {
          maker: {
            _id: '12345678',
          },
        },
        editedBy: [
          { userId: '1' },
          { userId: '1234' },
          { userId: '3' },
          { userId: '4' },
        ],
      };

      const user = {
        roles: ['maker', 'checker'],
        _id: '1234',
      };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker AND checker that has NOT created or edited the deal', () => {
    it('should return true', () => {
      const deal = {
        details: {
          maker: {
            _id: '12345678',
          },
        },
        editedBy: [
          { userId: '1' },
          { userId: '2' },
          { userId: '3' },
          { userId: '4' },
        ],
      };

      const user = {
        roles: ['maker', 'checker'],
        _id: '1234',
      };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(true);
    });
  });
});

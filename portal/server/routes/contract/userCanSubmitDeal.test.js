import userCanSubmitDeal from './userCanSubmitDeal';

describe('userCanSubmitDeal', () => {
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
          editedBy: [
            { _id: '1' },
            { _id: '1234' },
            { _id: '3' },
            { _id: '4' },
          ]
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

  describe('when user is a maker AND checker that has NOT created or edited the deal', () => {
    it('should return true', () => {
      const deal = {
        details: {
          maker: {
            _id: '12345678',
          },
          editedBy: [
            { _id: '1' },
            { _id: '2' },
            { _id: '3' },
            { _id: '4' },
          ]
        },
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

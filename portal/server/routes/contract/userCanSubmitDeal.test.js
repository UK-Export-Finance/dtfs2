import userCanSubmitDeal from './userCanSubmitDeal';

describe('userCanSubmitDeal', () => {
  describe('when deal has `Submitted` status', () => {
    it('should return false', () => {
      const deal = {
        status: 'Submitted',
      };

      const result = userCanSubmitDeal(deal);
      expect(result).toEqual(false);
    });
  });

  describe('when deal has `Rejected by UKEF` status', () => {
    it('should return false', () => {
      const deal = {
        status: 'Rejected by UKEF',
      };

      const result = userCanSubmitDeal(deal);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker that has created the deal', () => {
    it('should return false', () => {
      const deal = {
        maker: {
          _id: '1234',
        },
      };

      const user = {
        roles: ['maker'],
        _id: '1234',
      };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker AND checker that has created the deal', () => {
    it('should return false', () => {
      const deal = {
        maker: {
          _id: '1234',
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

  describe('when user is a maker that has edited the deal', () => {
    it('should return false', () => {
      const deal = {
        maker: {
          _id: '12345678',
        },
        editedBy: [
          { userId: '1' },
          { userId: '1234' },
          { userId: '3' },
          { userId: '4' },
        ],
      };

      const user = {
        roles: ['maker'],
        _id: '1234',
      };

      const result = userCanSubmitDeal(deal, user);
      expect(result).toEqual(false);
    });
  });

  describe('when user is a maker AND checker that has edited the deal', () => {
    it('should return false', () => {
      const deal = {
        maker: {
          _id: '12345678',
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
        maker: {
          _id: '12345678',
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

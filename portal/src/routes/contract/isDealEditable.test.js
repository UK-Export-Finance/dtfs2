import isDealEditable from './isDealEditable';

describe('isDealEditable', () => {
  const mockMakerUser = { roles: ['maker'] };

  describe('when user is NOT maker', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Further Maker\'s input required',
        },
      };

      const checkerUser = { roles: ['checker'] };

      const result = isDealEditable(mockDeal, checkerUser);
      expect(result).toEqual(false);
    });
  });

  describe('when deal status is NOT `Draft` or `Further Maker\'s input required`', () => {
    it('should return false', () => {
      const mockAcceptedDeal = {
        details: {
          status: 'Accepted by UKEF (with conditions)',
        },
      };

      const result = isDealEditable(mockAcceptedDeal, mockMakerUser);
      expect(result).toEqual(false);
    });
  });

  describe('when deal has been submitted', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Draft',
          submissionDate: 12345678,
        },
      };

      const result = isDealEditable(mockDeal, mockMakerUser);
      expect(result).toEqual(false);
    });
  });

  describe('when user is maker, deal status `Draft`, deal not submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Draft',
        },
      };

      const result = isDealEditable(mockDeal, mockMakerUser);
      expect(result).toEqual(true);
    });
  });

  describe('when user is maker, deal status `Further Maker\'s input required`, deal not submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Further Maker\'s input required',
        },
      };

      const result = isDealEditable(mockDeal, mockMakerUser);
      expect(result).toEqual(true);
    });
  });
});

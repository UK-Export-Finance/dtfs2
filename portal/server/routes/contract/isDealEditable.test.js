import { CHECKER, MAKER } from '../../constants/roles';
import isDealEditable from './isDealEditable';

describe('isDealEditable', () => {
  const mockMakerUser = { roles: [MAKER] };

  describe('when user is NOT maker', () => {
    it('should return false', () => {
      const mockDeal = {
        status: 'Further Maker\'s input required',
        details: {},
      };

      const checkerUser = { roles: [CHECKER] };

      const result = isDealEditable(mockDeal, checkerUser);
      expect(result).toEqual(false);
    });
  });

  describe('when deal status is NOT `Draft` or `Further Maker\'s input required`', () => {
    it('should return false', () => {
      const mockAcceptedDeal = {
        status: 'Accepted by UKEF (with conditions)',
        details: {},
      };

      const result = isDealEditable(mockAcceptedDeal, mockMakerUser);
      expect(result).toEqual(false);
    });
  });

  describe('when deal has been submitted', () => {
    it('should return false', () => {
      const mockDeal = {
        status: 'Draft',
        details: {
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
        status: 'Draft',
        details: {},
      };

      const result = isDealEditable(mockDeal, mockMakerUser);
      expect(result).toEqual(true);
    });
  });

  describe('when user is maker, deal status `Further Maker\'s input required`, deal not submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        status: 'Further Maker\'s input required',
        details: {},
      };

      const result = isDealEditable(mockDeal, mockMakerUser);
      expect(result).toEqual(true);
    });
  });
});

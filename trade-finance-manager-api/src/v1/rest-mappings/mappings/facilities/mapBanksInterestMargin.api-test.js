const mapBanksInterestMargin = require('./mapBanksInterestMargin');

describe('mapBanksInterestMargin', () => {
  describe('when facility product code is Bond', () => {
    it('should return facility riskMarginFee', () => {
      const mockBond = {
        facilityProduct: { code: 'BSS' },
        riskMarginFee: '12',
      };

      const result = mapBanksInterestMargin(mockBond);
      expect(result).toEqual(`${mockBond.riskMarginFee}%`);
    });
  });

  describe('when facility product code is Loan', () => {
    it('should return facility interestMarginFee', () => {
      const mockLoan = {
        facilityProduct: { code: 'EWCS' },
        interestMarginFee: '24',
      };

      const result = mapBanksInterestMargin(mockLoan);
      expect(result).toEqual(`${mockLoan.interestMarginFee}%`);
    });
  });

  it('should return null', () => {
    const mockFacility = {
      facilityProduct: { code: 'TEST' },
    };

    const result = mapBanksInterestMargin(mockFacility);
    expect(result).toEqual(null);
  });
});

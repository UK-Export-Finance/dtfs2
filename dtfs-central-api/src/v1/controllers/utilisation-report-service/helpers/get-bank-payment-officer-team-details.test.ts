import { getBankPaymentOfficerTeamDetails } from './get-bank-payment-officer-team-details';
import { aBank } from '../../../../../test-helpers';
import { getBankById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';

jest.mock('../../../../repositories/banks-repo');

console.error = jest.fn();

describe('get-bank-payment-officer-team-details', () => {
  const firstPaymentOfficerEmail = 'officer-1@example.com';
  const secondPaymentOfficerEmail = 'officer-2@example.com';
  const teamName = 'Payment Officer Team';

  const bankId = '123';

  const bank = {
    ...aBank(),
    paymentOfficerTeam: {
      teamName,
      emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail],
    },
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('when a bank is found', () => {
    it('should return the bank payment officer team details', async () => {
      jest.mocked(getBankById).mockResolvedValue(bank);

      const result = await getBankPaymentOfficerTeamDetails(bankId);

      const expected = {
        emails: [firstPaymentOfficerEmail, secondPaymentOfficerEmail],
        teamName,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when a bank is not found', () => {
    it('should throw a NotFoundError', async () => {
      // Arrange
      jest.mocked(getBankById).mockResolvedValue(null);

      // Act & Assert
      await expect(getBankPaymentOfficerTeamDetails(bankId)).rejects.toThrow(new NotFoundError(`Bank not found: ${bankId}`));
      expect(console.error).toHaveBeenCalledWith('Bank not found: %s', bankId);
    });
  });
});

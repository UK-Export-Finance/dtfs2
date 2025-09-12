import { getBankById } from '../../../../repositories/banks-repo';
import { NotFoundError } from '../../../../errors';

export const getBankPaymentOfficerTeamDetails = async (bankId: string) => {
  const bank = await getBankById(bankId);

  if (!bank) {
    console.error('Bank not found: %s', bankId);
    throw new NotFoundError(`Bank not found: ${bankId}`);
  }

  const { teamName, emails } = bank.paymentOfficerTeam;

  return {
    emails,
    teamName,
  };
};
